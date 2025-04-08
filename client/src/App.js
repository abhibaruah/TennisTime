import React from 'react';
import { useState } from 'react';
import './App.css';
import TennisForm from './components/TennisForm';
import Results from './components/Results';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        <h1>TennisTime Weather App</h1>
        <p>Find the best times to play tennis based on weather forecasts</p>
      </header>
      
      <main>
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
        
        <TennisForm 
          onSubmit={setResults} 
          onError={setError} 
          setLoading={setLoading} 
        />
        
        {loading && <div className="loading">Loading forecast data...</div>}
        
        {results && !loading && <Results data={results} />}
      </main>
      
      <footer>
        <p>TennisTime © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;