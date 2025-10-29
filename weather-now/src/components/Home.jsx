import React, { useEffect, useState } from 'react'

const Home = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    // const [isExist,setIsExist] = useState(false);
    // const [country,setCountry] = useState("");
    const [error, setError] = useState("");


    // for persistent data
    useEffect(() => {
        const savedCity = localStorage.getItem("city");
        const savedWeather = localStorage.getItem("weather");

        if (savedCity && savedWeather) {
            setCity(savedCity);
            setWeather(JSON.parse(savedWeather));
        }
    }, []);
    const fetchWeather = async () => {
        try {
            // add because after fetching a result user try to fetch another at that time 
            // all the previous data will erased 
            setError("");
            setWeather(null);

            // 1. user enter the city then first we find the coodinates using this api
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
            )
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                setError("City not found!");
                return;
            }
            // setIsExist(true);

            // 2. if given city exist then get the coordinates
            const { latitude, longitude, name, country } = geoData.results[0];
            // setCity(name);
            // setCountry(country);

            // 3.now find the weather details using the coords
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            const weatherData = await weatherResponse.json();

            const newWeather = {
                city: `${name},${country}`,
                temperature: weatherData.current_weather.temperature,
                windspeed: weatherData.current_weather.windspeed,
                weathercode: weatherData.current_weather.weathercode,
                time: weatherData.current_weather.time,
            };
            setWeather(newWeather);
            localStorage.setItem("city", city);
            localStorage.setItem("weather", JSON.stringify(newWeather));
        } catch (error) {
            setError("Failed to fetch weather data.");
        }
    };

    const resetInput = () => {
        setCity("");
        setWeather(null);
        setError("");
        localStorage.removeItem("city");
        localStorage.removeItem("weather");
    };
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-white mb-6">🌦️ Weather Now</h1>
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                {
                    !weather &&
                    (
                        <div>
                            <input
                                type="text"
                                placeholder="Enter city name"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={fetchWeather}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Get Weather
                            </button>
                        </div>
                    )
                }

                {/* if error the execute this one */}
                {error && <p className="text-red-500 mt-4">{error}</p>}

                {/* else coords will show */}
                {/* {isExist &&
                    <p>{`Name:${city}, Country:${country}`}</p>
                } */}
                {weather && (
                    <div className="mt-6 text-center">
                        <h2 className="text-2xl font-semibold">{weather.city}</h2>
                        <p className="text-lg mt-2">🌡️ {weather.temperature}°C</p>
                        <p className="text-lg">💨 {weather.windspeed} km/h</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Last updated: {new Date(weather.time).toLocaleString()}
                        </p>

                        <button
                            onClick={resetInput}
                            className="mt-5 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home