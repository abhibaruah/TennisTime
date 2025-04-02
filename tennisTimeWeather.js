require('dotenv').config();
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

// Configuration
const API_KEY = process.env.WEATHER_API_KEY;
const ZIP_CODE = '10001'; // Change to your desired zip code
const COUNTRY_CODE = 'US'; // Change to your country code if needed (US, UK, CA, etc.)
const DAYS = 5; // Number of days to forecast (including today)
const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM (20:00)
const OUTPUT_FILE = 'tennis_weather_data.xlsx';

async function fetchWeatherData() {
  try {
    // Format the location query as "zipcode,countrycode"
    const locationQuery = `${ZIP_CODE},${COUNTRY_CODE}`;
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${locationQuery}&days=${DAYS}&aqi=no&alerts=no`;
    
    console.log(`Fetching weather data for ZIP code ${ZIP_CODE} (${COUNTRY_CODE}) for the next ${DAYS} days...`);
    const response = await axios.get(url);
    
    if (!response.data || !response.data.forecast) {
      throw new Error('Invalid response from WeatherAPI');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    throw error;
  }
}

function processWeatherData(data) {
  const processedData = [];
  const locationName = data.location.name;
  const region = data.location.region;
  
  console.log(`Retrieved data for: ${locationName}, ${region}`);
  
  data.forecast.forecastday.forEach(day => {
    const date = day.date;
    
    // Filter hours between START_HOUR and END_HOUR
    day.hour.forEach(hour => {
      const hourOfDay = new Date(hour.time).getHours();
      
      if (hourOfDay >= START_HOUR && hourOfDay <= END_HOUR) {
        processedData.push({
          Date: date,
          Time: hour.time.split(' ')[1],
          'Temperature (°C)': hour.temp_c,
          'Wind Speed (kph)': hour.wind_kph,
          'Wind Direction': hour.wind_dir,
          'Rainfall (mm)': hour.precip_mm,
          'Humidity (%)': hour.humidity,
          Condition: hour.condition.text,
          Location: `${locationName}, ${region}`
        });
      }
    });
  });
  
  return processedData;
}

function saveToExcel(data, filename) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');
    
    // Adjust column widths
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 8 },  // Time
      { wch: 15 }, // Temperature
      { wch: 15 }, // Wind Speed
      { wch: 15 }, // Wind Direction
      { wch: 15 }, // Rainfall
      { wch: 15 }, // Humidity
      { wch: 25 }, // Condition
      { wch: 25 }, // Location
    ];
    
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, filename);
    console.log(`Weather data saved to ${filename}`);
  } catch (error) {
    console.error('Error saving to Excel:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const weatherData = await fetchWeatherData();
    const processedData = processWeatherData(weatherData);
    saveToExcel(processedData, OUTPUT_FILE);
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

main();
