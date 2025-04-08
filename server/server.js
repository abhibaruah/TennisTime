const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  getCoordinatesFromZip,
  getForecastUrl,
  fetchWeatherData,
  processWeatherData,
  saveToExcel
} = require('../tennisTimeNWS');

const {
  optimizeTennisTimes,
  CONSTRAINTS
} = require('../optimizeTennisTime');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM (20:00)
const OUTPUT_FILE = 'tennis_weather_nws_data.xlsx';
const OUTPUT_PATH = path.join('XLSX', OUTPUT_FILE);

// API Routes
app.get('/api/constraints', (req, res) => {
  res.json(CONSTRAINTS);
});

app.post('/api/forecast', async (req, res) => {
  try {
    const { zipCode = '02136', days = 5 } = req.body;
    
    if (isNaN(days) || days < 1 || days > 7) {
      return res.status(400).json({ error: 'Please enter a valid number of days between 1 and 7.' });
    }
    
    // Step 1: Convert ZIP code to coordinates
    const coordinates = await getCoordinatesFromZip(zipCode);
    
    // Step 2: Get the forecast URL for the location
    const { forecastUrl, locationInfo } = await getForecastUrl(coordinates.latitude, coordinates.longitude);
    console.log(coordinates.latitude)
    console.log(coordinates.longitude)
    console.log (locationInfo)
    
    // Step 3: Fetch the weather data
    const periods = await fetchWeatherData(forecastUrl);
    
    // Step 4: Process the data
    const processedData = processWeatherData(periods, locationInfo, days, START_HOUR, END_HOUR);
    
    // Step 5: Save to Excel
    saveToExcel(processedData, OUTPUT_FILE);
    
    // Step 6: Optimize tennis times
    const optimizedTimes = optimizeTennisTimes(OUTPUT_PATH, true); // Modified to return data
    
    res.json({
      zipCode,
      days,
      locationInfo,
      optimizedTimes,
      constraints: CONSTRAINTS
    });
    
  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`TennisTime API server running on port ${PORT}`);
});
