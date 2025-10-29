import React, { useState } from 'react'

const Home = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [isExist,setIsExist] = useState(false);
    const [country,setCountry] = useState("");
    const [error, setError] = useState("");

    const fetchWeather = async () => {
        try {
            // 1. user enter the city then first we find the coodinates using this api
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
            )
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                setError("City not found!");
                return;
            }
            setIsExist(true);
            

            // 2. if given city exist then get the coordinates
            const { latitude, longitude, name, country } = geoData.results[0];
            setCity(name);
            setCountry(country);
        } catch (error) {

        }

    }
    return (
        <div>
            <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={fetchWeather}>
                Get Coords
            </button>

            {/* if error the execute this one */}
            {error && <p>{error}</p>}

            {/* else coords will show */}
            {isExist && 
                <p>{`Name:${city}, Country:${country}`}</p>
            }
        </div>
    )
}

export default Home