import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  IconButton, 
  ThemeProvider, 
  createTheme,
  Fab,
  Tooltip,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import Login from './components/Login';
import Upload from './components/Upload';
import AnalyzeButton from './components/AnalyzeButton';
import CameraUpload from './components/CameraUpload';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadMethod, setUploadMethod] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#667eea',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#764ba2',
      },
    },
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUploadedFileName('');
    setExtractedData(null);
  };

  const handleOCRDataExtracted = async (csvData) => {
    console.log('Extracted CSV:', csvData);
    setExtractedData(csvData);
    
    try {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const file = new File([blob], `ocr-extracted-${Date.now()}.csv`, { type: 'text/csv' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadedFileName(result.fileName);
        alert('✅ Data extracted and uploaded successfully!\n\nYou can now analyze it.');
      } else {
        alert('❌ Upload failed: ' + result.error);
      }
    } catch (err) {
      alert('❌ Upload failed: ' + err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <Login onLogin={setIsLoggedIn} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)'
          : 'linear-gradient(135deg, #818CF8 0%, #C084FC 100%)',
        py: 4,
        transition: 'background 0.5s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Data Analytics Themed Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: darkMode ? 0.2 : 0.15,
          pointerEvents: 'none',
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(255, 255, 255, 0.05) 40px,
              rgba(255, 255, 255, 0.05) 42px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(255, 255, 255, 0.05) 40px,
              rgba(255, 255, 255, 0.05) 42px
            )
          `,
        }} />

        {/* Floating Chart Icons */}
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          opacity: darkMode ? 0.25 : 0.2,
        }}>
          <Box sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            fontSize: '120px',
            animation: 'float 20s ease-in-out infinite',
          }}>
            📊
          </Box>

          <Box sx={{
            position: 'absolute',
            bottom: '15%',
            left: '8%',
            fontSize: '100px',
            animation: 'float 25s ease-in-out infinite reverse',
          }}>
            📈
          </Box>

          <Box sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            fontSize: '90px',
            animation: 'float 18s ease-in-out infinite',
          }}>
            📉
          </Box>

          <Box sx={{
            position: 'absolute',
            top: '30%',
            left: '12%',
            fontSize: '80px',
            animation: 'float 22s ease-in-out infinite reverse',
          }}>
            💾
          </Box>

          <Box sx={{
            position: 'absolute',
            bottom: '25%',
            right: '20%',
            fontSize: '70px',
            animation: 'float 17s ease-in-out infinite',
          }}>
            📄
          </Box>

          <Box sx={{
            position: 'absolute',
            top: '45%',
            left: '25%',
            fontSize: '85px',
            animation: 'float 21s ease-in-out infinite reverse',
          }}>
            📋
          </Box>
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Box sx={{ 
              position: 'absolute',
              right: 0,
              top: 0,
              display: 'flex', 
              gap: 1,
              zIndex: 10
            }}>
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <IconButton 
                  onClick={() => setDarkMode(!darkMode)} 
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                    }
                  }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Logout">
                <IconButton 
                  onClick={handleLogout}
                  sx={{ 
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 99, 71, 0.4)',
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Heading with AWS Tagline */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                  mb: 0.5
                }}
              >
                Policy Impact Analyzer
              </Typography>
              <Typography 
                variant="caption"
                sx={{ 
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'block'
                }}
              >
                (Powered by AWS Cloud Services)
              </Typography>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 3
          }}>
            {/* Tabs */}
            <Paper 
              elevation={4} 
              sx={{ 
                width: '100%', 
                maxWidth: '600px', 
                bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'white',
                borderRadius: 2
              }}
            >
              <Tabs 
                value={uploadMethod} 
                onChange={(e, newValue) => {
                  setUploadMethod(newValue);
                  setUploadedFileName('');
                  setExtractedData(null);
                }}
                centered
                textColor={darkMode ? 'inherit' : 'primary'}
                indicatorColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
                  },
                  '& .Mui-selected': {
                    color: darkMode ? 'white' : 'inherit',
                  }
                }}
              >
                <Tab label="📁 CSV File" />
                <Tab label="📸 Image/OCR" />
              </Tabs>
            </Paper>

            {/* CSV Upload */}
            {uploadMethod === 0 && (
              <Upload onUploadSuccess={setUploadedFileName} />
            )}

            {/* Camera/OCR Upload */}
            {uploadMethod === 1 && (
              <CameraUpload onDataExtracted={handleOCRDataExtracted} />
            )}

            {/* Upload Confirmation */}
            {uploadedFileName && (
              <Box sx={{ 
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.25)', 
                p: 2.5, 
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                  ✅ {uploadMethod === 0 ? 'Uploaded' : 'Extracted & Uploaded'}: {uploadedFileName.split('/').pop()}
                </Typography>
                {uploadMethod === 1 && extractedData && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block', mt: 1 }}>
                    Extracted {extractedData.split('\n').length} lines from image
                  </Typography>
                )}
              </Box>
            )}

            {/* Analysis Button */}
            {uploadedFileName && (
              <AnalyzeButton fileName={uploadedFileName} />
            )}
          </Box>
        </Container>

        {/* Help Button */}
        <Tooltip title="Click theme icon to toggle light/dark mode">
          <Fab
            size="small"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              color: 'white',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            💡
          </Fab>
        </Tooltip>
      </Box

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, -20px) rotate(3deg); }
          66% { transform: translate(-15px, 15px) rotate(-3deg); }
        }
      `}</style>
    </ThemeProvider>
  );
}

export default App;
