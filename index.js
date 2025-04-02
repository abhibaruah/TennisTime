// Import the modules
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

const path = require('path');

// Configuration
const ZIP_CODE = '02136'; // Change to your desired zip code
const DAYS = 5; // Number of days to forecast (including today)
const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM (20:00)
const OUTPUT_FILE = 'tennis_weather_nws_data.xlsx';
const OUTPUT_PATH = path.join('XLSX', OUTPUT_FILE);

async function main() {
  try {
    console.log('=== TENNIS TIME WEATHER APP ===');
    console.log('Step 1: Fetching and processing weather data...');
    
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
    
    console.log('\nStep 2: Analyzing optimal tennis playing times...');
    console.log('Constraints:');
    console.log(`- Temperature > ${CONSTRAINTS.minTemperature}°C`);
    console.log(`- Wind Speed < ${CONSTRAINTS.maxWindSpeed} kph`);
    console.log(`- Precipitation Probability < ${CONSTRAINTS.maxPrecipitationProbability}%`);
    console.log(`- Humidity < ${CONSTRAINTS.maxHumidity}%`);
    
    // Step 6: Optimize tennis times
    optimizeTennisTimes(OUTPUT_PATH);
    
    console.log('\nProcess completed successfully!');
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

main();
