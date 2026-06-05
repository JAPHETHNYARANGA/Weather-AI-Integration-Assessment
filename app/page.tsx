'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FarmWeatherData, FarmingAnalysis, UsageData, Language } from './types';
import { useLocation } from './context/LocationContext';
import LocationSearch from './components/LocationSearch';
import {
  MapPin,
  Search,
  RefreshCw,
  Thermometer,
  Droplet,
  Wind,
  CloudRain,
  Sun,
  Sprout,
  Droplets,
  Scissors,
  Bug,
  FlaskConical,
  Activity,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  LocateFixed,
  Cloud,
  CloudSun,
  Umbrella,
  Eye,
  Gauge,
  Trees
} from 'lucide-react';
import AgroforestryAnalysis from './components/AgroforestryAnalysis';

const NAVROBO_LATLON: [number, number] = [-1.2921, 36.8219];

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'weather' | 'agroforestry'>('weather');
  const { location, error: locationError } = useLocation();
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
    queryKey: ['analysis', weatherData, language],
    queryFn: async () => {
      if (!weatherData) return null;
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherData, lang: language }),
      });
      if (!res.ok) throw new Error('Failed to analyze');
      return res.json();
    },
    enabled: !!weatherData,
  });

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
      aiAdvice: 'AI Recommendations',
      aiSummaryLabel: 'AI Summary',
      apiUsage: 'API Usage',
      resets: 'Resets',
      weatherApiCalls: 'Weather API Calls',
      aiSummaries: 'AI Summaries',
      weatherStatus: 'Weather Status',
      temp: 'Temperature',
      humidity: 'Humidity',
      wind: 'Wind Speed',
      rain: 'Rainfall',
      uv: 'UV Index',
      county: 'County',
      feelsLike: 'Feels like',
      planting: 'Planting',
      irrigation: 'Irrigation',
      harvest: 'Harvest',
      pestRisk: 'Pest Risk',
      fertilizer: 'Fertilizer',
      cropRecommendations: 'Crop Recommendations',
      riskAlerts: 'Risk Alerts',
      errorLoading: 'Error loading weather data. Please check your API key configuration.',
      retry: 'Retry',
      weatherTab: 'Weather & Crops',
      agroforestryTab: 'Agroforestry (Trees)',
    },
    sw: {
      title: 'Weather AI Msaidizi wa Kilimo',
      subtitle: 'Mapendekezo ya kilimo yenye akili kwa wakulima wa Kenya',
      getLocation: 'Tumia Eneo Langu',
      searchPlaceholder: 'Weka jina la jiji...',
      searchButton: 'Tafuta',
      refresh: 'Onyesha Upya',
      currentWeather: 'Hali ya Hewa ya Sasa',
      forecast: 'Utabiri wa Siku 7',
      aiAdvice: 'Mapendekezo ya Kilimo',
      aiSummaryLabel: 'Muhtasari wa AI',
      apiUsage: 'Matumizi ya API',
      resets: 'Inarejeshwa',
      weatherApiCalls: 'Maombi ya Hali ya Hewa',
      aiSummaries: 'Mihtasari ya AI',
      weatherStatus: 'Hali ya Hewa',
      temp: 'Joto',
      humidity: 'Unyevunyevu',
      wind: 'Mwendo wa Upepo',
      rain: 'Mvua',
      uv: 'Kiwango cha UV',
      county: 'Kaunti',
      feelsLike: 'Inahisi kama',
      planting: 'Upandaji',
      irrigation: 'Umwagiliaji',
      harvest: 'Mavuno',
      pestRisk: 'Hatari ya Wadudu',
      fertilizer: 'Mbolea',
      cropRecommendations: 'Mapendekezo ya Mazao',
      riskAlerts: 'Onyo za Hatari',
      errorLoading: 'Hitilafu kupakia data ya hewa. Tafadhali angalia usanidi wa API key yako.',
      retry: 'Jaribu Tena',
      weatherTab: 'Hewa na Mazao',
      agroforestryTab: 'Misitu ya Kilimo (Miti)',
    },
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['weather'] });
    refetchWeather();
  };

  const usagePercentage = usageData ? (usageData.requestsUsed / usageData.requestsLimit) * 100 : 0;
  const aiPercentage = usageData ? (usageData.aiUsed / usageData.aiLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                  {t[language].title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {t[language].subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${language === 'en'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('sw')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${language === 'sw'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                Kiswahili
              </button>
            </div>
          </div>
        </header>

        {/* API Usage Cards */}
        {usageData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  {t[language].apiUsage}
                </span>
                <span className="text-xs text-gray-500">{t[language].resets}: {new Date(usageData.resetDate).toLocaleDateString()}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t[language].weatherApiCalls}</span>
                    <span className="font-semibold">{usageData.requestsUsed}/{usageData.requestsLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                          usagePercentage > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t[language].aiSummaries}</span>
                    <span className="font-semibold">{usageData.aiUsed}/{usageData.aiLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${aiPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                          aiPercentage > 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}
                      style={{ width: `${Math.min(aiPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 shadow-lg border border-emerald-200/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{t[language].weatherStatus}</p>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    {weatherData?.current.temp ? `${Math.round(weatherData.current.temp)}°C` : '--'}
                  </p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <CloudSun className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-300 ${
              activeTab === 'weather'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-[1.02]'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/20'
            }`}
          >
            <CloudSun className="w-5 h-5" />
            {t[language].weatherTab}
          </button>
          <button
            onClick={() => setActiveTab('agroforestry')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-300 ${
              activeTab === 'agroforestry'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white scale-[1.02]'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/20'
            }`}
          >
            <Trees className="w-5 h-5" />
            {t[language].agroforestryTab}
          </button>
        </div>

        {activeTab === 'weather' ? (
          <>
            {/* Controls */}
            <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/20 mb-8 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <LocationSearch />
              </div>
              <button
                onClick={handleRefresh}
                disabled={weatherLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
                {t[language].refresh}
              </button>
            </div>

            {locationError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-xl mb-6 backdrop-blur-sm">
                {locationError}
              </div>
            )}

            {weatherLoading && !weatherData ? (
              <LoadingSkeleton />
            ) : weatherError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl mb-6">
                {t[language].errorLoading}
                <button onClick={handleRefresh} className="ml-3 underline font-semibold">{t[language].retry}</button>
              </div>
            ) : weatherData ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <CurrentWeatherCard data={weatherData} language={language} t={t[language]} />
                  <AIAdviceCard summary={weatherData.aiSummary} analysis={analysis} language={language} t={t[language]} />
                </div>
                <ForecastCard forecast={weatherData.forecast} language={language} t={t[language]} />
                {analysis && <FarmingInsightsCard analysis={analysis} language={language} t={t[language]} />}
              </>
            ) : null}
          </>
        ) : (
          <AgroforestryAnalysis language={language} />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type Translations = ReturnType<typeof buildTranslations>['en'];
function buildTranslations() {
  return {
    en: {
      title: '', subtitle: '', getLocation: '', searchPlaceholder: '', searchButton: '',
      refresh: '', currentWeather: '', forecast: '', aiAdvice: '', aiSummaryLabel: '',
      apiUsage: '', resets: '', weatherApiCalls: '', aiSummaries: '', weatherStatus: '',
      temp: '', humidity: '', wind: '', rain: '', uv: '', county: '', feelsLike: '',
      planting: '', irrigation: '', harvest: '', pestRisk: '', fertilizer: '',
      cropRecommendations: '', riskAlerts: '', errorLoading: '', retry: '',
    },
    sw: {} as Record<string, string>,
  };
}

function CurrentWeatherCard({ data, t }: { data: FarmWeatherData; language: Language; t: Translations }) {
  const getWeatherIcon = (temp: number) => {
    if (temp > 30) return <Sun className="w-12 h-12 text-yellow-500" />;
    if (temp > 20) return <CloudSun className="w-12 h-12 text-emerald-500" />;
    return <Cloud className="w-12 h-12 text-blue-500" />;
  };

  const metrics = [
    { icon: Thermometer, label: t.temp, value: `${Math.round(data.current.temp)}°C`, color: 'from-red-500 to-orange-500' },
    { icon: Droplet, label: t.humidity, value: `${data.current.humidity}%`, color: 'from-blue-500 to-cyan-500' },
    { icon: Wind, label: t.wind, value: `${data.current.windSpeed} km/h`, color: 'from-teal-500 to-emerald-500' },
    { icon: CloudRain, label: t.rain, value: `${data.current.rainfall} mm`, color: 'from-indigo-500 to-purple-500' },
    { icon: Sun, label: t.uv, value: data.current.uvIndex, color: 'from-yellow-500 to-orange-500' },
    { icon: MapPin, label: t.county, value: data.location.county || 'Kenya', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {getWeatherIcon(data.current.temp)}
            {t.currentWeather}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {data.location.county || 'Kenya'}, Kenya
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {Math.round(data.current.temp)}°C
          </p>
          <p className="text-sm text-gray-500">{t.feelsLike} {Math.round(data.current.temp)}°</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-gradient-to-br from-white/50 to-transparent dark:from-gray-900/50 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <metric.icon className={`w-4 h-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</span>
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIAdviceCard({ summary, analysis, t }: { summary: string; analysis: FarmingAnalysis | undefined; language: Language; t: Translations }) {
  const adviceItems = [
    { icon: Sprout, label: t.planting, key: 'plantingAdvice', color: 'from-green-500 to-emerald-500' },
    { icon: Droplets, label: t.irrigation, key: 'irrigationAdvice', color: 'from-blue-500 to-cyan-500' },
    { icon: Scissors, label: t.harvest, key: 'harvestAdvice', color: 'from-yellow-500 to-orange-500' },
    { icon: Bug, label: t.pestRisk, key: 'pestRisk', color: 'from-red-500 to-pink-500' },
    { icon: FlaskConical, label: t.fertilizer, key: 'fertilizerAdvice', color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="backdrop-blur-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 shadow-xl border border-emerald-200/30 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.aiAdvice}</h2>
      </div>

      {summary && (
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 backdrop-blur-sm border border-emerald-200/50">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">{t.aiSummaryLabel}</p>
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{summary}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-3">
          {adviceItems.map((item, idx) => {
            let value = analysis[item.key as keyof FarmingAnalysis];
            if (item.key === 'pestRisk' && analysis.pestRecommendation) {
              value = `${value} - ${analysis.pestRecommendation}`;
            }
            return (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white/40 dark:bg-gray-800/40 rounded-xl hover:bg-white/60 transition-all">
                <div className={`bg-gradient-to-r ${item.color} p-2 rounded-lg`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-100 mt-0.5">{value as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ForecastCard({ forecast, language, t }: { forecast: FarmWeatherData['forecast']; language: Language; t: Translations }) {
  const getDayName = (dateStr: string) => {
    const days = language === 'sw'
      ? ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  };

  return (
    <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.forecast}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {forecast.map((day, idx) => (
          <div key={idx} className="bg-gradient-to-b from-white/50 to-transparent dark:from-gray-900/50 rounded-xl p-3 text-center hover:scale-105 transition-all duration-300">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{getDayName(day.date)}</p>
            <p className="text-xs text-gray-500 mb-2">{day.date.slice(5)}</p>
            <div className="my-2">
              {day.rainChance > 50 ? (
                <Umbrella className="w-8 h-8 mx-auto text-blue-500" />
              ) : (
                <CloudSun className="w-8 h-8 mx-auto text-yellow-500" />
              )}
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(day.tempMax)}°</p>
            <p className="text-xs text-gray-500">{Math.round(day.tempMin)}°</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <CloudRain className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium">{day.rainChance}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FarmingInsightsCard({ analysis, t }: { analysis: FarmingAnalysis; language: Language; t: Translations }) {
  const crops = Object.entries(analysis.cropRecommendations);

  return (
    <div className="backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center gap-2 mb-6">
        <Sprout className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t.cropRecommendations}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {crops.map(([crop, advice]) => (
          <div key={crop} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-4 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 capitalize">{crop}</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{advice}</p>
          </div>
        ))}
      </div>

      {analysis.riskAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-200/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800 dark:text-red-200">{t.riskAlerts}</h3>
          </div>
          <ul className="space-y-2">
            {analysis.riskAlerts.map((alert, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                <ChevronRight className="w-4 h-4 mt-0.5" />
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}