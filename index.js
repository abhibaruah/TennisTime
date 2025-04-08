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
const prompt = require('prompt-sync')({ sigint: true });

// Configuration
// These will be replaced with user input
// const ZIP_CODE = '02136'; // Change to your desired zip code
// const DAYS = 5; // Number of days to forecast (including today)
const START_HOUR = 6; // 6 AM
const END_HOUR = 20; // 8 PM (20:00)
const OUTPUT_FILE = 'tennis_weather_nws_data.xlsx';
const OUTPUT_PATH = path.join('XLSX', OUTPUT_FILE);

async function main() {
  try {
    console.log('=== TENNIS TIME WEATHER APP ===');
    
    // Get user input for ZIP code
    const ZIP_CODE = prompt('Enter your ZIP code (default: 02136): ') || '02136';
    
    // Get user input for number of days to forecast
    let DAYS;
    do {
      const input = prompt('Enter number of days to forecast (1-7, default: 5): ') || '5';
      DAYS = parseInt(input);
      if (isNaN(DAYS) || DAYS < 1 || DAYS > 7) {
        console.log('Please enter a valid number between 1 and 7.');
      }
    } while (isNaN(DAYS) || DAYS < 1 || DAYS > 7);
    
    console.log(`Using ZIP code: ${ZIP_CODE}`);
    console.log(`Forecasting for ${DAYS} days`);
    console.log('\nStep 1: Fetching and processing weather data...');
    
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
