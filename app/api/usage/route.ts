import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Set WEATHER_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const url = `https://api.weather-ai.co/v1/usage`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 300 },
    });

    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch usage data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    const transformedData = {
      requestsUsed: data.requests_used ?? 0,
      requestsLimit: data.requests_limit ?? 1000,
      aiUsed: data.ai_used ?? 0,
      aiLimit: data.ai_limit ?? 200,
      resetDate: data.reset_date ?? new Date().toISOString(),
    };

    return NextResponse.json(transformedData, {
      headers: {
        'X-RateLimit-Remaining': rateLimitRemaining ?? '',
        'X-RateLimit-Reset': rateLimitReset ?? '',
      },
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}