import React, { useState } from 'react';
import './Results.css';

const Results = ({ data }) => {
  const { zipCode, days, locationInfo, optimizedTimes, nonParetoValidTimes, constraints, scoreCalculationInfo } = data;
  const [showScoreExplanation, setShowScoreExplanation] = useState(false);
  const [showAllValidTimes, setShowAllValidTimes] = useState(false);

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
        
        <div className="score-explanation-container">
          <button 
            className="score-explanation-toggle"
            onClick={() => setShowScoreExplanation(!showScoreExplanation)}
          >
            {showScoreExplanation ? 'Hide Score Explanation' : 'Show Score Explanation ▼'}
          </button>
          
          {showScoreExplanation && (
            <div className="score-explanation">
              <h4>How Pareto Score is Calculated:</h4>
              <p>The Pareto score represents optimal weather conditions for tennis on a scale from 0 to 1, where higher is better.</p>
              <ul>
                <li><strong>Temperature:</strong> {scoreCalculationInfo?.temperature || "Optimal around 20-25°C"}</li>
                <li><strong>Wind Speed:</strong> {scoreCalculationInfo?.wind || "Lower is better"}</li>
                <li><strong>Precipitation:</strong> {scoreCalculationInfo?.precipitation || "Lower probability is better"}</li>
                <li><strong>Humidity:</strong> {scoreCalculationInfo?.humidity || "Optimal around 40-60%"}</li>
              </ul>
              <p>The overall score is the average of these four individual scores.</p>
            </div>
          )}
        </div>
              </div>
      
      <h3>Best Times to Play (Pareto Optimal):</h3>
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
                      <span className="pareto-score">
                        Score: <span style={{ color: 'green', fontWeight: 'bold' }}>
                          {time.paretoScore ? time.paretoScore.toFixed(2) : 'N/A'}
                        </span>
                      </span>
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
      
      <div className="all-valid-times-container">
        <br />
        <br />
        <button 
          className="all-times-toggle"
          onClick={() => setShowAllValidTimes(!showAllValidTimes)}
        >
          {showAllValidTimes ? 'Hide Other Valid Times' : 'Show Other Valid Times ▼'}
        </button>
        
        {showAllValidTimes && (
          <div className="all-valid-times">
            <h3>Other Times Meeting Constraints:</h3>
            <div className="days-container">
              {nonParetoValidTimes.map((day, index) => (
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
                            <span className="pareto-score">
                              Score: <span style={{ color: 'green', fontWeight: 'bold' }}>
                                {time.paretoScore ? time.paretoScore.toFixed(2) : 'N/A'}
                              </span>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-times">No additional valid times found for this day.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
