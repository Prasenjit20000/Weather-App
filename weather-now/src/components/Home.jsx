import React, { useEffect, useState } from 'react'
import { WiThermometer, WiStrongWind, WiDaySunny, WiCloudy } from "react-icons/wi";
import { FiRefreshCw } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

const Home = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    // const [isExist,setIsExist] = useState(false);
    // const [country,setCountry] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        if (!city.trim()) {
            setError("Please enter a city name!");
            return;
        }
        try {
            // add because after fetching a result user try to fetch another at that time 
            // all the previous data will erased 
            setError("");
            setWeather(null);
            // start the loader for the button
            setLoading(true);

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
            // const { latitude, longitude, name, country } = geoData.results.sort(
            //     (a, b) => (b.population || 0) - (a.population || 0)
            // )[0];
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
        finally {
            setLoading(false);
        }
    };

    const resetInput = () => {
        setCity("");
        setWeather(null);
        setError("");
        localStorage.removeItem("city");
        localStorage.removeItem("weather");
    };

    const getWeatherIcon = (code) => {
        if (code === 0) return <WiDaySunny className="text-yellow-400 text-7xl" />;
        if (code >= 1 && code <= 3)
            return <WiCloudy className="text-gray-400 text-7xl" />;
        return <WiDaySunny className="text-blue-400 text-7xl" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 flex flex-col items-center justify-center px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                <WiDaySunny className="text-yellow-400 text-5xl -mt-1" />
                <span className='text-black'>Weather Now</span>
            </h1>

            <div className="bg-white rounded-2xl shadow-2xl shadow-blue-200 p-6 w-full max-w-md">
                {
                    !weather &&
                    (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault(); // prevent page reload
                                fetchWeather();
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Enter city name"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            {/* <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Get Weather
                            </button> */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white py-2 rounded-lg transition ${loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <FaSpinner className="animate-spin text-xl" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    "Get Weather"
                                )}
                            </button>
                        </form>
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

                        <div className="flex flex-col items-center mt-4">
                            {getWeatherIcon(weather.weathercode)}
                            <p className="flex items-center gap-2 text-lg mt-2">
                                <WiThermometer className="text-3xl text-red-500" /> {weather.temperature}°C
                            </p>
                            <p className="flex items-center gap-2 text-lg">
                                <WiStrongWind className="text-3xl text-blue-500" /> {weather.windspeed} km/h
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Last updated: {new Date(weather.time).toLocaleString()}
                            </p>
                        </div>

                        <button
                            onClick={resetInput}
                            className="mt-5 flex items-center justify-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                            <FiRefreshCw /> Reset
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home