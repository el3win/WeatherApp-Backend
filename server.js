require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.Weather_API_KEY;

if (!API_KEY) {
  console.warn(
    "Warning: Weather_API_KEY is not set in environment. Requests may fail."
  );
}

app.get("/api/weather", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.json({ error: "Please provide a city name" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);

    const data = {
      name: response.data.name,
      country: response.data.sys.country,
      temp: Math.round(response.data.main.temp),
      feels_like: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      wind: response.data.wind.speed,
    };

    res.json(data);
  } catch {
    res.json({ error: "City not found" });
  }
});

app.get("/api/forecast", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.json({ error: "Please provide a city name" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);

    const daily = response.data.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 5);

    const forecast = daily.map((item) => ({
      date: item.dt_txt.split(" ")[0],
      temp: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    }));

    res.json(forecast);
  } catch {
    res.json({ error: "City not found" });
  }
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server running succesfully on http://localhost:${PORT}`);
});
