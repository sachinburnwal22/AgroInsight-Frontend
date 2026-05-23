import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: "Missing lat/lng coordinates" }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid lat/lng coordinates" }, { status: 400 });
    }

    // 2. Build urls
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,rain_sum,wind_speed_10m_max&past_days=7&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`;

    // 3. Concurrently fetch all weather components from server-side
    const [geoResult, weatherResult, aqiResult] = await Promise.allSettled([
      axios.get(nominatimUrl, {
        headers: {
          "User-Agent": "AgroInsight/1.0 (sachi.gemini.antigravity)",
          "Accept-Language": "en"
        },
        timeout: 4500
      }),
      axios.get(weatherUrl, { timeout: 6000 }),
      axios.get(aqiUrl, { timeout: 4500 })
    ]);

    // Parse geocode info
    let location = { city: "Pinned Coordinate", state: "India" };
    if (geoResult.status === "fulfilled" && geoResult.value.data?.address) {
      const addr = geoResult.value.data.address;
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || "Pinned Location";
      const state = addr.state || addr.region || "India";
      location = { city, state };
    }

    // Parse weather info
    let weatherData = null;
    if (weatherResult.status === "fulfilled") {
      weatherData = weatherResult.value.data;
    } else {
      throw new Error("Core weather forecast API failed");
    }

    // Parse AQI
    let aqiValue = 45;
    if (aqiResult.status === "fulfilled" && aqiResult.value.data?.current) {
      aqiValue = aqiResult.value.data.current.us_aqi || 45;
    }

    // Parse History (sliced from past_days daily forecast array)
    let history: any[] = [];
    if (weatherResult.status === "fulfilled" && weatherResult.value.data?.daily) {
      const histDaily = weatherResult.value.data.daily;
      const histTimes = histDaily.time.slice(0, 7);
      history = histTimes.map((timeStr: string, idx: number) => {
        const d = new Date(timeStr);
        const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return {
          date: monthDay,
          tempMax: Math.round(histDaily.temperature_2m_max[idx]),
          tempMin: Math.round(histDaily.temperature_2m_min[idx]),
          rain: Number((histDaily.rain_sum[idx] || 0).toFixed(1)),
          wind: Math.round(histDaily.wind_speed_10m_max[idx] || 0)
        };
      });
    }

    return NextResponse.json({
      location,
      weather: weatherData,
      aqi: aqiValue,
      history
    });
  } catch (error: any) {
    console.error("Server-side weather API failed:", error.message || error);
    try {
      const fs = require("fs");
      const path = require("path");
      const logPath = "d:\\PROJECTS@\\AgroInsight\\frontend\\weather_debug.log";
      const errorMsg = `[${new Date().toISOString()}] Error: ${error.message || error}\nStack: ${error.stack || ""}\n\n`;
      fs.appendFileSync(logPath, errorMsg, "utf8");
    } catch (fsErr) {
      console.error("Failed to write to weather_debug.log:", fsErr);
    }
    return NextResponse.json({ error: "Failed to collect weather intelligence" }, { status: 500 });
  }
}
