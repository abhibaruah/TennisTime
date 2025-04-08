import React from 'react';
import './Results.css';

const Results = ({ data }) => {
  const { zipCode, days, locationInfo, optimizedTimes, constraints } = data;

  // Add this console log to see the actual structure
  console.log('Location Info:', locationInfo);
  return (
    <div className="results">
      <div className="results-header">
        <h2>Optimal Tennis Times</h2>
        <p className="location-info">
          Location: {locationInfo.city}, {locationInfo.state}
        </p>
        <p>ZIP Code: {zipCode}</p>
        <p>Forecast for {days} days</p>
      </div>
              <div className="constraints">
                <h3>Constraints Used:</h3>
                <ul>
                  <li>Temperature &gt; {constraints.minTemperature}°C</li>
                  <li>Wind Speed &lt; {constraints.maxWindSpeed} kph</li>
                  <li>Precipitation Probability &lt; {constraints.maxPrecipitationProbability}%</li>
                  <li>Humidity &lt; {constraints.maxHumidity}%</li>
                </ul>
              </div>
      
      <h3>Best Times to Play:</h3>
      <div className="days-container">
        {optimizedTimes.map((day, index) => (
          <div key={index} className="day-card">
            <h4>{day.date}</h4>
            {day.bestTimes && day.bestTimes.length > 0 ? (
              <ul>
                {day.bestTimes.map((time, timeIndex) => (
                  <li key={timeIndex}>
                    <div className="time">{time.time}</div>
                    <div className="conditions">
                      <span>Temp: {time.temperature}°C</span>
                      <span>Wind: {time.windSpeed} kph</span>
                      <span>Precip: {time.precipitationProbability}%</span>
                      <span>Humidity: {time.humidity}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-times">No optimal times found for this day.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
