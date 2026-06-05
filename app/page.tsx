'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FarmWeatherData, FarmingAnalysis, UsageData, Language } from './types';

const NAVROBO_LATLON: [number, number] = [-1.2921, 36.8219];

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [location, setLocation] = useState<[number, number]>(NAVROBO_LATLON);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState('');
  const queryClient = useQueryClient();

  const { data: weatherData, isLoading: weatherLoading, error: weatherError, refetch: refetchWeather } = useQuery<FarmWeatherData>({
    queryKey: ['weather', location[0], location[1], language],
    queryFn: async () => {
      const res = await fetch(`/api/weather?lat=${location[0]}&lon=${location[1]}&lang=${language}`);
      if (!res.ok) throw new Error('Failed to fetch weather');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
  });

  const { data: usageData } = useQuery<UsageData>({
    queryKey: ['usage'],
    queryFn: async () => {
      const res = await fetch('/api/usage');
      if (!res.ok) throw new Error('Failed to fetch usage');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: analysis } = useQuery<FarmingAnalysis>({
    queryKey: ['analysis', weatherData],
    queryFn: async () => {
      if (!weatherData) return null;
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData }),
      });
      if (!res.ok) throw new Error('Failed to analyze');
      return res.json();
    },
    enabled: !!weatherData,
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setLocationError('Location permission denied. Using Nairobi as default.'),
        { timeout: 10000 }
      );
    }
  }, []);

  const t = {
    en: {
      title: 'Weather AI Farming Assistant',
      subtitle: 'AI-powered farming recommendations for Kenyan farmers',
      getLocation: 'Use My Location',
      searchPlaceholder: 'Enter city name...',
      searchButton: 'Search',
      refresh: 'Refresh',
      currentWeather: 'Current Weather',
      forecast: '7-Day Forecast',
      aiAdvice: 'AI Farming Recommendations',
      apiUsage: 'API Usage',
      requestsLeft: 'requests remaining',
      aiSummariesLeft: 'AI summaries remaining',
      temp: 'Temperature',
      humidity: 'Humidity',
      wind: 'Wind Speed',
      rain: 'Rainfall',
      uv: 'UV Index',
      planting: 'Planting Advice',
      irrigation: 'Irrigation Advice',
      harvest: 'Harvest Advice',
      pestRisk: 'Pest Risk',
      fertilizer: 'Fertilizer Timing',
      cropRecommendations: 'Crop Recommendations',
      riskAlerts: 'Risk Alerts',
      setupGuide: 'Setup Guide',
      setupApiKey: 'Please set up your Weather API key in the environment variables.',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    sw: {
      title: 'Weather AI Msaidizi wa Kilimo',
      subtitle: 'Mapendekezo ya kilimo yenye akili kwa wakulima wa Kenya',
      getLocation: 'Tumia Eneo Langu',
      searchPlaceholder: 'Weka jina la jiji...',
      searchButton: 'Tafuta',
      refresh: 'Onyesha Upya',
      currentWeather: 'Hali ya Hewa ya Sasa',
      forecast: 'Onkoreji 7 Days',
      aiAdvice: 'Mapendekezo ya Kilimo',
      apiUsage: 'Matumizi ya API',
      requestsLeft: 'maombi yaliyobaki',
      aiSummariesLeft: 'muhtasari uliokabidhi',
      temp: 'Temperatura',
      humidity: 'Unyevunyevu',
      wind: 'Mwendo wa Upepo',
      rain: 'Mvua',
      uv: 'UV Index',
      planting: 'Mapendekezo ya Upanda',
      irrigation: 'Mapendekezo ya Umwagiliaji',
      harvest: 'Mapendekezo ya Harvest',
      pestRisk: 'Hatari ya wadudu',
      fertilizer: 'Wakati wa Fertilizer',
      cropRecommendations: 'Mapendekezo ya Mimea',
      riskAlerts: 'Onyo',
      setupGuide: 'Mwongozo wa Setup',
      setupApiKey: 'Tafadhali weka Weather API key yako kwenye variables za mazingira.',
      days: ['Jum', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
  };

  const handleCitySearch = async () => {
    if (!searchCity) return;
    try {
      const res = await fetch('/api/geocode?city=' + encodeURIComponent(searchCity));
      if (res.ok) {
        const data = await res.json();
        setLocation([data.lat, data.lon]);
      }
    } catch {
      // Fallback to Nairobi
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['weather'] });
    refetchWeather();
  };

  const usagePercentage = usageData ? (usageData.requestsUsed / usageData.requestsLimit) * 100 : 0;
  const aiPercentage = usageData ? (usageData.aiUsed / usageData.aiLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-950">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">{t[language].title}</h1>
            <p className="text-green-600 dark:text-green-400">{t[language].subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded ${language === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('sw')}
              className={`px-3 py-1 rounded ${language === 'sw' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Swahili
            </button>
          </div>
        </header>

        {usageData && (
          <div className="bg-white dark:bg-green-900 rounded-lg p-4 mb-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{t[language].apiUsage}</span>
              <span className="text-xs text-gray-500">Resets: {new Date(usageData.resetDate).toLocaleDateString()}</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs">
                  <span>{t[language].requestsLeft}: {usageData.requestsUsed}/{usageData.requestsLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-600'}`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span>{t[language].aiSummariesLeft}: {usageData.aiUsed}/{usageData.aiLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${aiPercentage > 90 ? 'bg-red-500' : aiPercentage > 70 ? 'bg-yellow-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(aiPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={() => {
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
                  () => setLocationError('Permission denied'),
                  { timeout: 10000 }
                );
              }
            }}
            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {t[language].getLocation}
          </button>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder={t[language].searchPlaceholder}
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleCitySearch}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              {t[language].searchButton}
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={weatherLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            {weatherLoading ? '...' : t[language].refresh}
          </button>
        </div>

        {locationError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-4">
            {locationError}
          </div>
        )}

{weatherLoading && !weatherData ? (
           <LoadingSkeleton />
         ) : weatherError ? (
           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
             Error loading weather data. Please check your API key configuration.
             <button onClick={handleRefresh} className="ml-2 underline">Retry</button>
           </div>
         ) : weatherData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <CurrentWeatherCard data={weatherData} language={language} />
              <AIAdviceCard summary={weatherData.aiSummary} analysis={analysis} language={language} />
            </div>
            <ForecastCard forecast={weatherData.forecast} language={language} />
            {analysis && <FarmingInsightsCard analysis={analysis} language={language} />}
          </>
        ) : null}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-green-900 rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function CurrentWeatherCard({ data, language }: { data: FarmWeatherData; language: Language }) {
  const t = {
    en: { temp: 'Temperature', humidity: 'Humidity', wind: 'Wind', rain: 'Rain', uv: 'UV' },
    sw: { temp: 'Temperatura', humidity: 'Unyevunyevu', wind: 'Upepo', rain: 'Mvua', uv: 'UV' },
  };

  return (
    <div className="bg-white dark:bg-green-900 rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">
        {language === 'en' ? 'Current Weather' : 'Hali ya Hewa ya Sasa'}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <span className="text-4xl font-bold text-green-700 dark:text-green-300">{Math.round(data.current.temp)}°C</span>
          <p className="text-sm text-gray-600">{t[language].temp}</p>
        </div>
        <div className="text-center">
          <span className="text-2xl font-semibold">{data.current.humidity}%</span>
          <p className="text-sm text-gray-600">{t[language].humidity}</p>
        </div>
        <div className="text-center">
          <span className="text-xl">{data.current.windSpeed} km/h</span>
          <p className="text-sm text-gray-600">{t[language].wind}</p>
        </div>
        <div className="text-center">
          <span className="text-xl">{data.current.rainfall} mm</span>
          <p className="text-sm text-gray-600">{t[language].rain}</p>
        </div>
        <div className="text-center">
          <span className="text-xl">{data.current.uvIndex}</span>
          <p className="text-sm text-gray-600">{t[language].uv}</p>
        </div>
        <div className="text-center">
          <span className="text-sm">{data.location.county || '-'}</span>
          <p className="text-xs text-gray-500">Kenya</p>
        </div>
      </div>
    </div>
  );
}

function AIAdviceCard({ summary, analysis, language }: { summary: string; analysis: FarmingAnalysis | undefined; language: Language }) {
  const t = {
    en: { title: 'AI Farming Recommendations', planting: 'Planting', irrigation: 'Irrigation', harvest: 'Harvest', pest: 'Pest Risk', fertilizer: 'Fertilizer', crops: 'Crops' },
    sw: { title: 'Mapendekezo ya Kilimo', planting: 'Upanda', irrigation: 'Umwagiliaji', harvest: 'Harvest', pest: 'Hatari ya wadudu', fertilizer: 'Fertilizer', crops: 'Mimea' },
  };

  return (
    <div className="bg-white dark:bg-green-900 rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">{t[language].title}</h2>
      {summary && (
        <p className="text-sm mb-3 p-3 bg-green-50 dark:bg-green-800 rounded">{summary}</p>
      )}
      {analysis && (
        <div className="space-y-2 text-sm">
          <p><strong>{t[language].planting}:</strong> {analysis.plantingAdvice}</p>
          <p><strong>{t[language].irrigation}:</strong> {analysis.irrigationAdvice}</p>
          <p><strong>{t[language].harvest}:</strong> {analysis.harvestAdvice}</p>
          <p><strong>{t[language].pest}:</strong> {analysis.pestRisk} - {analysis.pestRecommendation}</p>
          <p><strong>{t[language].fertilizer}:</strong> {analysis.fertilizerAdvice}</p>
        </div>
      )}
    </div>
  );
}

function ForecastCard({ forecast, language }: { forecast: FarmWeatherData['forecast']; language: Language }) {
  const t = {
    en: { title: '7-Day Forecast', rain: 'Rain' },
    sw: { title: 'Onkoreji 7 Days', rain: 'Mvua' },
  };

  return (
    <div className="bg-white dark:bg-green-900 rounded-lg p-6 shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">{t[language].title}</h2>
      <div className="grid grid-cols-7 gap-2 text-center">
{forecast.map((day) => (
           <div key={day.date} className="p-2">
             <p className="text-xs font-medium">{language === 'sw' ? ['Jum', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(day.date).getDay()] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(day.date).getDay()]}</p>
             <p className="text-xs">{day.date.slice(5)}</p>
             <span className="text-lg">{Math.round(day.tempMax)}°/{Math.round(day.tempMin)}°</span>
             <p className="text-xs">{day.rainChance}% {t[language].rain}</p>
           </div>
         ))}
      </div>
    </div>
  );
}

function FarmingInsightsCard({ analysis, language }: { analysis: FarmingAnalysis; language: Language }) {
  const t = {
    en: { crops: 'Crop Recommendations', risks: 'Risk Alerts' },
    sw: { crops: 'Mapendekezo ya Mimea', risks: 'Onyo' },
  };

  return (
    <div className="bg-white dark:bg-green-900 rounded-lg p-6 shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">{t[language].crops}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {Object.entries(analysis.cropRecommendations).map(([crop, advice]) => (
          <div key={crop} className="p-3 bg-green-50 dark:bg-green-800 rounded">
            <p className="font-medium capitalize">{crop}</p>
            <p className="text-sm">{advice}</p>
          </div>
        ))}
      </div>
      {analysis.riskAlerts.length > 0 && (
        <>
          <h3 className="font-semibold text-red-700 mb-2">{t[language].risks}</h3>
          <ul className="space-y-1">
            {analysis.riskAlerts.map((alert, idx) => (
              <li key={idx} className="text-sm text-red-600">{alert}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}