export interface FarmWeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    rainfall: number;
    uvIndex: number;
    condition: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    rainChance: number;
    rainfall: number;
    humidity?: number;
    condition: string;
  }>;
  aiSummary: string;
  location: {
    lat: number;
    lon: number;
    county?: string;
  };
}

export interface FarmingAnalysis {
  plantingAdvice: string;
  irrigationAdvice: string;
  harvestAdvice: string;
  pestRisk: 'LOW' | 'MODERATE' | 'HIGH';
  pestRecommendation: string;
  fertilizerAdvice: string;
  riskAlerts: string[];
  cropRecommendations: Record<string, string>;
  analysis: {
    temperatureTrend: 'warming' | 'cooling' | 'stable';
    rainfallTotal: number;
    droughtRisk: boolean;
    floodRisk: boolean;
    pestConditions: boolean;
    plantingWindows: string[];
    harvestingWindows: string[];
    cropHealth: Record<string, 'optimal' | 'good' | 'fair' | 'poor'>;
  };
}

export interface UsageData {
  requestsUsed: number;
  requestsLimit: number;
  aiUsed: number;
  aiLimit: number;
  resetDate: string;
}

export interface LocationData {
  lat: number;
  lon: number;
  county?: string;
  city?: string;
}

export type Language = 'en' | 'sw';

export interface FarmingJournalEntry {
  date: string;
  crop: string;
  activity: string;
  weather: string;
  notes: string;
}