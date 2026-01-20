import React from 'react';
import { Button, Typography, Box } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ p: 4, backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Policy Impact Analyzer
      </Typography>
      <Button variant="contained" color="primary">
        Analyze Data
      </Button>
    </Box>
  );
}

export default Dashboard;
