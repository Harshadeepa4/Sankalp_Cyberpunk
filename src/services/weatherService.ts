import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Function to get current weather by location
export async function getCurrentWeather(location: string) {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: location,
        appid: API_KEY,
        units: 'metric' // For Celsius
      }
    });

    const data = response.data;
    
    return {
      temperature: `${Math.round(data.main.temp)}°C`,
      humidity: `${data.main.humidity}%`,
      windSpeed: `${data.wind.speed} m/s`,
      rainfall: data.rain ? `${data.rain['1h'] || 0}mm` : '0mm',
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: 'N/A',
      humidity: 'N/A',
      windSpeed: 'N/A',
      rainfall: 'N/A',
      description: 'Weather data unavailable',
      icon: '01d'
    };
  }
}

// Function to get 5-day forecast by location
export async function getForecast(location: string) {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: location,
        appid: API_KEY,
        units: 'metric',
        cnt: 40 // 5 days, 8 data points per day (every 3 hours)
      }
    });

    // Process and simplify the forecast data
    const forecastData = response.data.list.filter((_: any, index: number) => index % 8 === 0); // Get one forecast per day
    
    return forecastData.map((item: any) => ({
      date: new Date(item.dt * 1000).toLocaleDateString(),
      temperature: `${Math.round(item.main.temp)}°C`,
      humidity: `${item.main.humidity}%`,
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }));
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return [];
  }
}