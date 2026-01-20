const express = require('express');
const AWS = require('aws-sdk');
const csv = require('csv-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Configure AWS
AWS.config.update({
  accessKeyId: 
  secretAccessKey: 'Qvfpo5lxD01rc059yBvrutYMvGBvariwllMnof1I',
  region: 'eu-north-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = 'policy-impact-tracker'; // Your S3 bucket

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// UPLOAD ENDPOINT - Upload CSV to S3
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();
    
    console.log('✅ File uploaded to S3 successfully!');
    console.log('   Bucket:', BUCKET_NAME);
    console.log('   Key:', fileName);
    console.log('   Location:', uploadResult.Location);

    res.json({
      success: true,
      message: 'File uploaded successfully to S3',
      fileName: fileName,
      bucket: BUCKET_NAME,
      location: uploadResult.Location
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// ANALYSIS ENDPOINT - Analyze CSV Data
app.post('/analyze', async (req, res) => {
  try {
    const { fileName, analysisType } = req.body;

    if (!fileName || !analysisType) {
      return res.status(400).json({ error: 'Missing fileName or analysisType' });
    }

    console.log('📊 Starting analysis...');
    console.log('   File:', fileName);
    console.log('   Type:', analysisType);

    // Step 1: Read CSV file from S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName
    };

    const s3Stream = s3.getObject(params).createReadStream();
    const rows = [];

    // Step 2: Parse CSV data
    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          console.log(`✅ Parsed ${rows.length} rows from CSV`);
          resolve();
        })
        .on('error', reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Step 3: Perform analysis based on type
    let result;

    switch (analysisType) {
      case 'Statistical Summary':
        result = performStatisticalSummary(rows);
        break;

      case 'Trend Detection':
        result = performTrendDetection(rows);
        break;

      case 'Comparison':
        result = performComparison(rows);
        break;

      case 'Charts':
        result = performChartData(rows);
        break;

      default:
        return res.status(400).json({ error: 'Invalid analysis type' });
    }

    console.log('✅ Analysis completed successfully');

    res.json({
      success: true,
      analysisType: analysisType,
      result: result
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// ANALYSIS FUNCTIONS

// 1. Statistical Summary
function performStatisticalSummary(rows) {
  const columns = Object.keys(rows[0]);
  const summary = {};

  columns.forEach(column => {
    const values = rows.map(row => row[column]);
    const numericValues = values.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));

    if (numericValues.length > 0) {
      // Calculate statistics for numeric columns
      summary[column] = {
        count: numericValues.length,
        mean: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2),
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        median: calculateMedian(numericValues)
      };
    } else {
      // For non-numeric columns, show count and unique values
      const uniqueValues = [...new Set(values)];
      summary[column] = {
        count: values.length,
        uniqueCount: uniqueValues.length,
        sampleValues: uniqueValues.slice(0, 5) // Show first 5 unique values
      };
    }
  });

  return {
    totalRows: rows.length,
    totalColumns: columns.length,
    columnSummary: summary
  };
}

// 2. Trend Detection
function performTrendDetection(rows) {
  const columns = Object.keys(rows[0]);
  const trends = {};

  columns.forEach(column => {
    const values = rows.map(row => parseFloat(row[column]));
    
    if (values.every(v => !isNaN(v))) {
      // Calculate trend (simple linear trend)
      const n = values.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

      values.forEach((y, x) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const trend = slope > 0.1 ? 'Increasing' : slope < -0.1 ? 'Decreasing' : 'Stable';

      trends[column] = {
        trend: trend,
        slope: slope.toFixed(4),
        change: ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(2) + '%'
      };
    }
  });

  return {
    message: 'Trend analysis completed',
    trends: trends
  };
}

// 3. Comparison
function performComparison(rows) {
  const columns = Object.keys(rows[0]);
  const comparison = {};

  columns.forEach(column => {
    const values = rows.map(row => parseFloat(row[column]));
    
    if (values.every(v => !isNaN(v))) {
      const midpoint = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, midpoint);
      const secondHalf = values.slice(midpoint);

      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      comparison[column] = {
        firstHalfAverage: avg1.toFixed(2),
        secondHalfAverage: avg2.toFixed(2),
        difference: (avg2 - avg1).toFixed(2),
        percentageChange: ((avg2 - avg1) / avg1 * 100).toFixed(2) + '%'
      };
    }
  });

  return {
    message: 'Comparison analysis completed',
    comparison: comparison
  };
}

// 4. Chart Data
function performChartData(rows) {
  const columns = Object.keys(rows[0]);
  const chartData = {};

  columns.forEach(column => {
    const values = rows.map(row => row[column]);
    const numericValues = values.filter(v => !isNaN(parseFloat(v))).map(v => parseFloat(v));

    if (numericValues.length > 0) {
      chartData[column] = {
        type: 'line',
        data: numericValues.slice(0, 50), // Limit to first 50 points for chart
        labels: rows.slice(0, 50).map((_, i) => `Point ${i + 1}`)
      };
    }
  });

  return {
    message: 'Chart data prepared',
    charts: chartData
  };
}

// Helper function: Calculate median
function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
    : sorted[mid].toFixed(2);
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📦 S3 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: eu-north-1`);
});


