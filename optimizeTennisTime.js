const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Define constraints
const CONSTRAINTS = {
  minTemperature: 4, // °C
  maxWindSpeed: 20, // kph
  maxPrecipitationProbability: 45, // %
  maxHumidity: 95, // %
};

// Function to read Excel file
function readExcelFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Successfully read ${data.length} records from ${filePath}`);
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error.message);
    process.exit(1);
  }
}

// Function to filter data based on constraints
function filterValidTimeSlots(data) {
  return data.filter(record => {
    // Parse numeric values
    const temperature = parseFloat(record['Temperature (°C)']);
    const windSpeed = parseFloat(record['Wind Speed (kph)']);
    const precipProbability = parseFloat(record['Precipitation Probability (%)']);
    
    // Handle humidity which might be 'N/A'
    let humidity = record['Humidity (%)'];
    humidity = humidity === 'N/A' ? 0 : parseFloat(humidity);
    
    // Apply constraints
    return (
      temperature > CONSTRAINTS.minTemperature &&
      windSpeed < CONSTRAINTS.maxWindSpeed &&
      precipProbability < CONSTRAINTS.maxPrecipitationProbability &&
      humidity < CONSTRAINTS.maxHumidity
    );
  });
}

// Function to calculate score for each objective
function calculateScores(validTimeSlots) {
  return validTimeSlots.map(slot => {
    const temperature = parseFloat(slot['Temperature (°C)']);
    const windSpeed = parseFloat(slot['Wind Speed (kph)']);
    const precipProbability = parseFloat(slot['Precipitation Probability (%)']);
    
    // Handle humidity which might be 'N/A'
    let humidity = slot['Humidity (%)'];
    humidity = humidity === 'N/A' ? 0 : parseFloat(humidity);
    
    // Calculate scores (higher is better)
    // For temperature, optimal is around 20-25°C
    const temperatureScore = temperature < 20 ? temperature / 20 : (30 - temperature) / 5;
    
    // For wind, lower is better
    const windScore = 1 - (windSpeed / CONSTRAINTS.maxWindSpeed);
    
    // For precipitation, lower is better
    const precipScore = 1 - (precipProbability / CONSTRAINTS.maxPrecipitationProbability);
    
    // For humidity, optimal is around 40-60%
    const humidityScore = humidity < 40 ? humidity / 40 : 
                          humidity > 60 ? (100 - humidity) / 40 : 1;
    
    return {
      ...slot,
      temperatureScore,
      windScore,
      precipScore,
      humidityScore,
      // Overall score (simple average)
      overallScore: (temperatureScore + windScore + precipScore + humidityScore) / 4
    };
  });
}

// Function to find Pareto optimal solutions
function findParetoFront(scoredTimeSlots) {
  const paretoFront = [];
  
  for (const slot of scoredTimeSlots) {
    // Check if this slot is dominated by any other slot
    const isDominated = scoredTimeSlots.some(otherSlot => {
      if (slot === otherSlot) return false;
      
      // Check if otherSlot dominates slot (better in all objectives)
      return (
        otherSlot.temperatureScore >= slot.temperatureScore &&
        otherSlot.windScore >= slot.windScore &&
        otherSlot.precipScore >= slot.precipScore &&
        otherSlot.humidityScore >= slot.humidityScore &&
        // At least one objective must be strictly better
        (
          otherSlot.temperatureScore > slot.temperatureScore ||
          otherSlot.windScore > slot.windScore ||
          otherSlot.precipScore > slot.precipScore ||
          otherSlot.humidityScore > slot.humidityScore
        )
      );
    });
    
    if (!isDominated) {
      paretoFront.push(slot);
    }
  }
  
  // Sort by date and time for easier reading
  return paretoFront.sort((a, b) => {
    if (a.Date === b.Date) {
      return a.Time.localeCompare(b.Time);
    }
    return a.Date.localeCompare(b.Date);
  });
}

// Function to format and display results
function displayResults(paretoFront) {
  console.log('\n===== OPTIMAL TENNIS TIMES (PARETO FRONT) =====');
  console.log('Constraints applied:');
  console.log(`- Temperature > ${CONSTRAINTS.minTemperature}°C`);
  console.log(`- Wind Speed < ${CONSTRAINTS.maxWindSpeed} kph`);
  console.log(`- Precipitation Probability < ${CONSTRAINTS.maxPrecipitationProbability}%`);
  console.log(`- Humidity < ${CONSTRAINTS.maxHumidity}%`);
  console.log('\nFound', paretoFront.length, 'optimal time slots:');
  
  paretoFront.forEach((slot, index) => {
    console.log(`\n[${index + 1}] ${slot.Date} at ${slot.Time} - ${slot.Location}`);
    console.log(`   Temperature: ${slot['Temperature (°C)']}°C (Score: ${slot.temperatureScore.toFixed(2)})`);
    console.log(`   Wind: ${slot['Wind Speed (kph)']} kph, ${slot['Wind Direction']} (Score: ${slot.windScore.toFixed(2)})`);
    console.log(`   Precipitation Probability: ${slot['Precipitation Probability (%)']}% (Score: ${slot.precipScore.toFixed(2)})`);
    console.log(`   Humidity: ${slot['Humidity (%)']}% (Score: ${slot.humidityScore.toFixed(2)})`);
    console.log(`   Condition: ${slot.Condition}`);
    console.log(`   Overall Score: ${slot.overallScore.toFixed(2)}`);
  });
}

// Main function
function main() {
  try {
    // Path to the Excel file
    const filePath = path.join('XLSX', 'tennis_weather_nws_data.xlsx');
    
    // Read the data
    const weatherData = readExcelFile(filePath);
    
    // Filter valid time slots based on constraints
    const validTimeSlots = filterValidTimeSlots(weatherData);
    console.log(`Found ${validTimeSlots.length} time slots that meet all constraints`);
    
    // Calculate scores for each objective
    const scoredTimeSlots = calculateScores(validTimeSlots);
    
    // Find Pareto optimal solutions
    const paretoFront = findParetoFront(scoredTimeSlots);
    
    // Display results
    displayResults(paretoFront);
    
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
