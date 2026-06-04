import { NextResponse } from 'next/server';

interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  rain_chance?: number;
  rainfall?: number;
  humidity?: number;
  condition: string;
}

interface WeatherResponse {
  current: {
    temp: number;
    humidity: number;
    wind_speed: number;
    rainfall?: number;
    uv_index: number;
    condition: string;
  };
  forecast: ForecastDay[];
  ai_summary?: string;
  location?: { county?: string };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const days = searchParams.get('days') || '7';
    const ai = searchParams.get('ai') || 'true';
    const units = searchParams.get('units') || 'metric';
    const lang = searchParams.get('lang') || 'en';

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Set WEATHER_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const url = `https://api.weather-ai.co/v1/weather?lat=${lat}&lon=${lon}&days=${days}&ai=${ai}&units=${units}&lang=${lang}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 300 },
    });

    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            resetTime: rateLimitReset,
            resetDate: rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : null
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch weather data' },
        { status: response.status }
      );
    }

    const data: WeatherResponse = await response.json();

    const transformedData = {
      current: {
        temp: data.current?.temp ?? 0,
        humidity: data.current?.humidity ?? 0,
        windSpeed: data.current?.wind_speed ?? 0,
        rainfall: data.current?.rainfall ?? 0,
        uvIndex: data.current?.uv_index ?? 0,
        condition: data.current?.condition ?? 'Unknown',
      },
      forecast: (data.forecast ?? []).map((day: ForecastDay) => ({
        date: day.date,
        tempMax: day.temp_max ?? 0,
        tempMin: day.temp_min ?? 0,
        rainChance: day.rain_chance ?? 0,
        rainfall: day.rainfall ?? 0,
        humidity: day.humidity,
        condition: day.condition ?? 'Unknown',
      })),
      aiSummary: data.ai_summary ?? '',
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        county: data.location?.county,
      },
    };

    return NextResponse.json(transformedData, {
      headers: {
        'X-RateLimit-Remaining': rateLimitRemaining ?? '',
        'X-RateLimit-Reset': rateLimitReset ?? '',
        'X-RateLimit-Limit': rateLimitLimit ?? '',
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}