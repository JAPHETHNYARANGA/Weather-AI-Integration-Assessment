import { NextResponse } from 'next/server';

interface ApiForecastDay {
  date: string;
  temp_max?: number;
  temp_min?: number;
  rain_chance?: number;
  rainfall?: number;
  humidity?: number;
  condition?: string;
}

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  rainfall: number;
  humidity: number;
  condition: string;
}

interface WeatherResponse {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    uvIndex: number;
    condition: string;
  };
  forecast: ForecastDay[];
  aiSummary: string;
  location: { lat: number; lon: number; county?: string };
}

function getDemoWeatherData(lat: string, lon: string): WeatherResponse {
  const today = new Date();
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      tempMax: 22 + Math.floor(Math.random() * 8),
      tempMin: 15 + Math.floor(Math.random() * 5),
      rainChance: 20 + Math.floor(Math.random() * 40),
      rainfall: 5 + Math.floor(Math.random() * 15),
      humidity: 60 + Math.floor(Math.random() * 20),
      condition: 'Partly Cloudy',
    };
  });

  return {
    current: {
      temp: 24,
      humidity: 70,
      windSpeed: 10,
      rainfall: 0,
      uvIndex: 6,
      condition: 'Partly Cloudy',
    },
    forecast,
    aiSummary: 'Good conditions for planting maize and beans. Moderate rainfall expected mid-week. Consider irrigation if no rain in 3 days.',
    location: {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      county: 'Nairobi',
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(getDemoWeatherData(lat, lon));
    }

    const url = `https://api.weather-ai.co/v1/weather?lat=${lat}&lon=${lon}&days=7&units=metric`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 300 },
    }).catch(() => null);

    if (!response || !response.ok) {
      return NextResponse.json(getDemoWeatherData(lat, lon));
    }

    const data = await response.json();

    if (!data.current || !data.forecast?.length) {
      return NextResponse.json(getDemoWeatherData(lat, lon));
    }

    const transformedData: WeatherResponse = {
      current: {
        temp: data.current.temp ?? 24,
        humidity: data.current.humidity ?? 70,
        windSpeed: data.current.wind_speed ?? 10,
        rainfall: data.current.rainfall ?? 0,
        uvIndex: data.current.uv_index ?? 6,
        condition: data.current.condition ?? 'Partly Cloudy',
      },
      forecast: data.forecast.map((day: ApiForecastDay) => {
        return {
          date: day.date,
          tempMax: day.temp_max ?? 22,
          tempMin: day.temp_min ?? 15,
          rainChance: day.rain_chance ?? 30,
          rainfall: day.rainfall ?? 5,
          humidity: day.humidity ?? 65,
          condition: day.condition ?? 'Partly Cloudy',
        };
      }),
      aiSummary: data.ai_summary ?? 'Good conditions for farming activities.',
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        county: data.location?.county,
      },
    };

    return NextResponse.json(transformedData);
  } catch {
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat') || '-1.2921';
    const lon = url.searchParams.get('lon') || '36.8219';
    return NextResponse.json(getDemoWeatherData(lat, lon));
  }
}