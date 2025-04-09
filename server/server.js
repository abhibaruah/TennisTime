const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  getCoordinatesFromZip,
  getForecastUrl,
  fetchWeatherData,
  processWeatherData,
  saveToExcel
} = require('./tennisTimeNWS');

const {
  optimizeTennisTimes,
  CONSTRAINTS
} = require('./optimizeTennisTime');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const OUTPUT_FILE = 'tennis_weather_nws_data.xlsx';
const OUTPUT_PATH = path.join('XLSX', OUTPUT_FILE);

// API Routes
app.get('/api/constraints', (req, res) => {
  res.json(CONSTRAINTS);
});

app.post('/api/forecast', async (req, res) => {
  try {
    const { zipCode = '02136', days = 5, startHour, endHour} = req.body;
    
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
    const processedData = processWeatherData(periods, locationInfo, days, startHour, endHour-1);
    
    // Step 5: Save to Excel
    saveToExcel(processedData, OUTPUT_FILE);
    
    // Step 6: Optimize tennis times
    const optimizationResults = optimizeTennisTimes(OUTPUT_PATH, true); // Modified to return data
    
    // Add score calculation explanation to the response
    const scoreCalculationInfo = {
      temperature: "For temperature, optimal is around 20-25°C. Score decreases as temperature moves away from this range.",
      wind: "For wind, lower speeds get higher scores. Maximum score at 0 kph, minimum at constraint maximum.",
      precipitation: "For precipitation probability, lower chances get higher scores. Maximum score at 0%, minimum at constraint maximum.",
      humidity: "For humidity, optimal is around 40-60%. Score decreases as humidity moves away from this range."
    };
    
    res.json({
      zipCode,
      days,
      locationInfo,
      optimizedTimes: optimizationResults.paretoTimes,
      nonParetoValidTimes: optimizationResults.nonParetoValidTimes,
      constraints: CONSTRAINTS,
      scoreCalculationInfo // Add this to the response
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
