require('dotenv').config();
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

// NWS API requires a user-agent header with contact information
const headers = {
  'User-Agent': '(TennisTime Weather App, avi123frank@gmail.com)',
  'Accept': 'application/geo+json'
};

async function getCoordinatesFromZip(zipCode, country = "US") {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          postalcode: zipCode,
          country: country, // Defaults to US, can be changed if needed
          format: "json"
        }
      }
    );

    // Ensure response contains valid data
    if (!response.data || response.data.length === 0) {
      throw new Error(`Could not find coordinates for ZIP code ${zipCode}`);
    }

    // Extract the first valid result
    const location = response.data[0];
    return {
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon)
    };
  } catch (error) {
    console.error("Error getting coordinates from ZIP code:", error.message);
    throw error;
  }
}

// Function to get the forecast URL for a specific location
async function getForecastUrl(latitude, longitude) {
  try {
    // First, get the grid endpoint for the coordinates
    const pointsUrl = `https://api.weather.gov/points/${latitude},${longitude}`;
    const pointsResponse = await axios.get(pointsUrl, { headers });
    
    if (!pointsResponse.data || !pointsResponse.data.properties || !pointsResponse.data.properties.forecast) {
      throw new Error('Invalid response from NWS Points API');
    }
    
    // Extract the forecast URL from the response
    const forecastUrl = pointsResponse.data.properties.forecastHourly;
    const locationInfo = {
      city: pointsResponse.data.properties.relativeLocation.properties.city,
      state: pointsResponse.data.properties.relativeLocation.properties.state
    };
    
    return { forecastUrl, locationInfo };
  } catch (error) {
    console.error('Error getting forecast URL:', error.message);
    throw error;
  }
}

// Function to fetch the hourly forecast data
async function fetchWeatherData(forecastUrl) {
  try {
    console.log('Fetching hourly forecast data...');
    const response = await axios.get(forecastUrl, { headers });
    
    if (!response.data || !response.data.properties || !response.data.properties.periods) {
      throw new Error('Invalid response from NWS Forecast API');
    }
    
    return response.data.properties.periods;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw error;
  }
}

// Function to process the weather data
function processWeatherData(periods, locationInfo, days, startHour, endHour) {
  const processedData = [];
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + days - 1);
  
  console.log(`Retrieved data for: ${locationInfo.city}, ${locationInfo.state}`);
  
  // Filter periods to include only the next DAYS days
  periods.forEach(period => {
    // Create a date object from the period's start time
    const periodDate = new Date(period.startTime);
    
    // Only include data for the specified number of days
    if (periodDate <= endDate) {
      const hourOfDay = periodDate.getHours();
      
      // Only include hours between START_HOUR and END_HOUR (inclusive)
      if (hourOfDay >= startHour && hourOfDay <= endHour) {
        // Format the date properly - use the local date
        const date = periodDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        
        // Format the time - use local time
        const hours = periodDate.getHours().toString().padStart(2, '0');
        const minutes = periodDate.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        
        // Convert wind speed from mph to kph
        const windSpeedMph = parseFloat(period.windSpeed.match(/\d+/)[0]);
        const windSpeedKph = (windSpeedMph * 1.60934).toFixed(1);
        
        // NWS doesn't provide direct rainfall data in hourly forecast
        // We'll use the probability of precipitation as an indicator
        
        processedData.push({
          Date: date,
          Time: time,
          'Temperature (°C)': ((period.temperature - 32) * 5/9).toFixed(1),
          'Wind Speed (kph)': windSpeedKph,
          'Wind Direction': period.windDirection,
          'Precipitation Probability (%)': period.probabilityOfPrecipitation?.value || 0,
          'Humidity (%)': period.relativeHumidity?.value || 'N/A',
          Condition: period.shortForecast,
          Location: `${locationInfo.city}, ${locationInfo.state}`
        });
      }
    }
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
      { wch: 25 }, // Precipitation Probability
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

// Export all the functions
module.exports = {
  getCoordinatesFromZip,
  getForecastUrl,
  fetchWeatherData,
  processWeatherData,
  saveToExcel
};
