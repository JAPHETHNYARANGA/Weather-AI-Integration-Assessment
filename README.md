# Weather AI Farming Assistant

AI-powered farming recommendations for Kenyan farmers using weather data.

## Features

- Current weather + 7-day forecast
- AI-generated farming advice (planting, irrigation, harvest timing)
- Pest/disease risk assessment
- Crop-specific recommendations (maize, tea, coffee, tomatoes, potatoes)
- API usage tracking
- Bilingual support (English/Swahili)
- Mobile-responsive design

## Setup

1. **Get API Key**
   - Visit [weather-ai.co](https://weather-ai.co)
   - Create account and get free API key (1,000 requests/month, 200 AI summaries/month)

2. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your WEATHER_API_KEY
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## API Routes

- `GET /api/weather?lat=X&lon=Y` - Weather data + AI summary
- `GET /api/usage` - API quota usage
- `POST /api/analyze` - Farming insights from weather data
- `GET /api/geocode?city=name` - City coordinates lookup

## Usage

The app helps farmers answer:
- Should I plant today?
- When should I irrigate?
- Are pest conditions favorable?
- Is it safe to apply fertilizer?
- Should I harvest before rain?
- How much API quota remains?

## Deployment

Deploy to Vercel with environment variable `WEATHER_API_KEY` set in project settings.

## License

MIT