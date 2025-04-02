// Import the module functions
const {
  getCoordinatesFromZip,
  getForecastUrl,
  fetchWeatherData,
  processWeatherData,
  saveToExcel
} = require('./tennisTimeNWS');

// Configuration
const ZIP_CODE = '02453'; // Change to your desired zip code
const DAYS = 5; // Number of days to forecast (including today)
const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM (20:00)
const OUTPUT_FILE = 'tennis_weather_nws_data.xlsx';

async function main() {
  try {
    // Step 1: Convert ZIP code to coordinates
    console.log(`Getting coordinates for ZIP code ${ZIP_CODE}...`);
    const coordinates = await getCoordinatesFromZip(ZIP_CODE);
    console.log(`Coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
    
    // Step 2: Get the forecast URL for the location
    const { forecastUrl, locationInfo } = await getForecastUrl(coordinates.latitude, coordinates.longitude);
    console.log(`Forecast URL: ${forecastUrl}`);
    
    // Step 3: Fetch the weather data
    const periods = await fetchWeatherData(forecastUrl);
    
    // Step 4: Process the data
    const processedData = processWeatherData(periods, locationInfo, DAYS, START_HOUR, END_HOUR);
    
    // Step 5: Save to Excel
    saveToExcel(processedData, OUTPUT_FILE);
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

main();
