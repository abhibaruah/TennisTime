import React, { useState } from 'react';
import axios from 'axios';
import './TennisForm.css';

const TennisForm = ({ onSubmit, onError, setLoading }) => {
  const [zipCode, setZipCode] = useState('02136');
  const [days, setDays] = useState(5);
  const [startHour, setStartHour] = useState(6); // Default: 6 AM
  const [endHour, setEndHour] = useState(20); // Default: 8 PM (20:00)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/forecast', {
        zipCode,
        days: parseInt(days),
        startHour: parseInt(startHour),
        endHour: parseInt(endHour)
      });
      
      onSubmit(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data) {
        onError(error.response.data.error);
      } else {
        onError('An error occurred while fetching the forecast data.');
      }
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code:</label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="days">Number of Days to Forecast (1-7):</label>
          <input
            type="number"
            id="days"
            min="1"
            max="7"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="startHour">Start Hour (0-23):</label>
          <input
            type="number"
            id="startHour"
            min="0"
            max="23"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endHour">End Hour (0-23):</label>
          <input
            type="number"
            id="endHour"
            min="0"
            max="23"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="submit-button">Get Tennis Times</button>
      </form>
    </div>
  );
};

export default TennisForm;
