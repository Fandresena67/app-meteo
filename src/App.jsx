import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;



  // useEffect(() => {
  //   fetchWeather("Fianarantsoa");
  // }, []);
 
  useEffect(() => {
    handleGeoloc("");
  }, []);
 

  function handleGeoloc() {
    setError("");
    navigator.geolocation?.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Géoloc refusée. Cherche une ville.");
        getWeatherByCity("Antananarivo");
lo      }
    );
  }

  async function getWeatherByCoords(lat, lon) {
    setLoading(true);
    setError("");
    try {
      const res1 = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);
      const data1 = await res1.json();
      if (data1.cod!== 200) throw new Error(data1.message);
      setWeather(data1);
      
      const res2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);
      const data2 = await res2.json();
      const daily = data2.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
    } catch (err) {
      setError("Erreur: " + err.message);
    }
    setLoading(false);
  }

  async function getWeatherByCity(cityName) {
    if (!cityName) return;
    setLoading(true);
    setError("");
    try {
      const res1 = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`);
      const data1 = await res1.json();
      if (data1.cod!== 200) throw new Error(data1.message);
      setWeather(data1);
      setCity(data.name); // ← AJOUTE CETTE LIGNE
      const res2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=fr`);
      const data2 = await res2.json();
      const daily = data2.list.filter((_, i) => i % 8 === 0).slice(0, 5);
      setForecast(daily);
    } catch (err) {
      setError("Ville non trouvée");
    }
    setLoading(false);
  }

  const handleSearch = () => getWeatherByCity(city);
  const handleKey = e => e.key === "Enter" && handleSearch();

  return (
    <div className={dark? 'app dark' : 'app'}>
      <header className="header">
        <div className="logo">
          <span className="rouge">Fa</span>ndresena
        </div>
        <button className="toggle" onClick={() => setDark(!dark)}>
          {dark? '☀️' : '🌙'}
        </button>
      </header>

      <main className="container">
        <h1>App Météo</h1>

        <div className="search">
          <input 
            value={city} 
            onChange={e => setCity(e.target.value)} 
            onKeyDown={handleKey}
            placeholder="Entrez une ville..." 
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading? "..." : "Chercher"}
          </button>
        </div>

        {!weather &&!loading && (
          <button className="btn-geo" onClick={handleGeoloc}>
            📍 Activer la géolocalisation
          </button>
        )}

        {error && <p className="erreur">{error}</p>}

        {weather && (
          <div className="current">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <img 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
              alt={weather.weather[0].description} 
            />
            <p className="temp">{Math.round(weather.main.temp)}°C</p>
            <p className="desc">{weather.weather[0].description}</p>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            <h3>Prévisions 5 jours</h3>
            <div className="days">
              {forecast.map((day, i) => (
                <div key={i} className="day">
                  <p>{new Date(day.dt * 1000).toLocaleDateString("fr", {weekday: "short"})}</p>
                  <img 
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                    alt={day.weather[0].description} 
                  />
                  <p className="minmax">
                    <span>{Math.round(day.main.temp_max)}°</span>
                    <span>{Math.round(day.main.temp_min)}°</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
