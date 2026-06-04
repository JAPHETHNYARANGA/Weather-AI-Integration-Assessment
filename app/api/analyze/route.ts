import { NextResponse } from 'next/server';

interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  rainfall: number;
  humidity?: number;
  condition: string;
}

interface CurrentWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  uvIndex: number;
  condition: string;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: WeatherDay[];
  aiSummary: string;
  location: { lat: number; lon: number; county?: string };
}

export async function POST(request: Request) {
  try {
    const { weatherData } = await request.json();

    if (!weatherData) {
      return NextResponse.json(
        { error: 'Weather data is required' },
        { status: 400 }
      );
    }

    const analysis = generateFarmingAnalysis(weatherData);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFarmingAnalysis(weatherData: WeatherData) {
  const { current, forecast } = weatherData;

  const temps = forecast.map((day) => day.tempMax);
  const temperatureTrend = calculateTrend(temps);

  const rainfallTotal = forecast.reduce((sum, day) => sum + (day.rainfall || 0), 0);

  const droughtRisk = forecast.every((day) => (day.rainfall || 0) < 5);
  const floodRisk = forecast.some((day) => (day.rainfall || 0) > 50);
  const pestConditions = checkPestRisk(current.humidity, forecast);

  const plantingWindows = findOptimalPlantingDays(forecast);
  const harvestingWindows = findHarvestingDays(forecast);

  const cropHealth = {
    maize: evaluateCropCondition('maize', current, forecast),
    tea: evaluateCropCondition('tea', current, forecast),
    coffee: evaluateCropCondition('coffee', current, forecast),
    tomatoes: evaluateCropCondition('tomatoes', current, forecast),
    potatoes: evaluateCropCondition('potatoes', current, forecast)
  };

  const plantingAdvice = generatePlantingAdvice(weatherData);
  const irrigationAdvice = generateIrrigationAdvice(weatherData);
  const harvestAdvice = generateHarvestAdvice(weatherData);
  const pestRisk = getPestRiskLevel(pestConditions);
  const pestRecommendation = generatePestRecommendation(pestConditions);
  const fertilizerAdvice = generateFertilizerAdvice(weatherData);
  const riskAlerts = generateRiskAlerts(weatherData);
  const cropRecommendations = generateCropRecommendations(weatherData);

  return {
    plantingAdvice,
    irrigationAdvice,
    harvestAdvice,
    pestRisk,
    pestRecommendation,
    fertilizerAdvice,
    riskAlerts,
    cropRecommendations,
    analysis: {
      temperatureTrend,
      rainfallTotal,
      droughtRisk,
      floodRisk,
      pestConditions,
      plantingWindows,
      harvestingWindows,
      cropHealth
    }
  };
}

function calculateTrend(values: number[]): 'warming' | 'cooling' | 'stable' {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.ceil(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 1) return 'warming';
  if (diff < -1) return 'cooling';
  return 'stable';
}

function checkPestRisk(humidity: number, forecast: WeatherDay[]): boolean {
  const avgTemp = forecast.reduce((sum, day) => sum + ((day.tempMax + day.tempMin) / 2), 0) / forecast.length;

  return humidity > 70 && avgTemp > 20;
}

function findOptimalPlantingDays(forecast: WeatherDay[]): string[] {
  return forecast
    .filter((day) => {
      const avgTemp = (day.tempMax + day.tempMin) / 2;
      return avgTemp >= 15 && avgTemp <= 28 && (day.rainChance || 0) >= 20;
    })
    .map((day) => day.date);
}

function findHarvestingDays(forecast: WeatherDay[]): string[] {
  return forecast
    .filter((day) => (day.rainChance || 0) < 30)
    .map((day) => day.date);
}

type CropCondition = 'optimal' | 'good' | 'fair' | 'poor';

interface CropConfig {
  optimalTemp: [number, number];
  maxHumidity?: number;
  minRain?: number;
}

function evaluateCropCondition(crop: string, _current: CurrentWeather, forecast: WeatherDay[]): CropCondition {
  const cropConfigs: Record<string, CropConfig> = {
    maize: { optimalTemp: [20, 28], maxHumidity: 80 },
    tea: { optimalTemp: [18, 25], minRain: 1500 },
    coffee: { optimalTemp: [17, 23], maxHumidity: 70 },
    tomatoes: { optimalTemp: [20, 25], maxHumidity: 80 },
    potatoes: { optimalTemp: [15, 20], maxHumidity: 70 }
  };

  const config = cropConfigs[crop];
  if (!config) return 'fair';

  const avgTemp = forecast.reduce((sum, day) => sum + ((day.tempMax + day.tempMin) / 2), 0) / forecast.length;
  const avgHumidity = forecast.reduce((sum, day) => sum + (day.humidity || _current.humidity), 0) / forecast.length;

  let score = 0;

  if (avgTemp >= config.optimalTemp[0] && avgTemp <= config.optimalTemp[1]) {
    score += 40;
  } else if (avgTemp >= config.optimalTemp[0] - 5 && avgTemp <= config.optimalTemp[1] + 5) {
    score += 20;
  }

  if (config.maxHumidity && avgHumidity <= config.maxHumidity) {
    score += 30;
  } else if (config.maxHumidity && avgHumidity <= config.maxHumidity + 10) {
    score += 15;
  }

  const totalRainfall = forecast.reduce((sum, day) => sum + (day.rainfall || 0), 0);
  if (config.minRain) {
    const weeklyRain = totalRainfall;
    const neededWeekly = config.minRain / 52;
    if (weeklyRain >= neededWeekly * 0.8) {
      score += 30;
    } else if (weeklyRain >= neededWeekly * 0.5) {
      score += 15;
    }
  } else {
    if (totalRainfall < 100) {
      score += 30;
    } else if (totalRainfall < 150) {
      score += 15;
    }
  }

  if (score >= 80) return 'optimal';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function generatePlantingAdvice(weatherData: WeatherData): string {
  const { forecast } = weatherData;
  const avgTemp = forecast.reduce((sum, day) => sum + ((day.tempMax + day.tempMin) / 2), 0) / forecast.length;
  const rainChance = forecast.reduce((sum, day) => sum + (day.rainChance || 0), 0) / forecast.length;

  if (avgTemp < 10) {
    return "Too cold for planting. Wait for warmer temperatures.";
  } else if (avgTemp > 35) {
    return "Too hot for planting. Wait for cooler temperatures.";
  } else if (rainChance < 20) {
    return "Low rain expected. Consider irrigation if planting now.";
  } else {
    return "Good conditions for planting. Soil moisture should be adequate.";
  }
}

function generateIrrigationAdvice(weatherData: WeatherData): string {
  const { forecast } = weatherData;
  const rainForecast = forecast.slice(0, 3);
  const willRain = rainForecast.some((day) => (day.rainChance || 0) > 40);

  if (willRain) {
    return "Rain expected in the next 3 days. Reduce irrigation schedule.";
  } else {
    return "Little rain expected. Maintain or increase irrigation as needed.";
  }
}

function generateHarvestAdvice(weatherData: WeatherData): string {
  const { forecast } = weatherData;
  const rainRisk = forecast.slice(0, 2).some((day) => (day.rainChance || 0) > 60);

  if (rainRisk) {
    return "Rain expected soon. Consider harvesting mature crops before precipitation.";
  } else {
    return "Dry conditions favorable for harvesting. Proceed as planned.";
  }
}

function getPestRiskLevel(conditions: boolean): 'LOW' | 'MODERATE' | 'HIGH' {
  return conditions ? 'HIGH' : 'LOW';
}

function generatePestRecommendation(conditions: boolean): string {
  if (conditions) {
    return "High pest risk due to warm, humid conditions. Consider preventive treatments and increased scouting.";
  } else {
    return "Low pest risk. Continue regular monitoring.";
  }
}

function generateFertilizerAdvice(weatherData: WeatherData): string {
  const { forecast } = weatherData;
  const heavyRainExpected = forecast.some((day) => (day.rainfall || 0) > 20);

  if (heavyRainExpected) {
    return "Heavy rain expected. Delay fertilizer application to prevent runoff.";
  } else {
    return "Conditions favorable for fertilizer application.";
  }
}

function generateRiskAlerts(weatherData: WeatherData): string[] {
  const alerts: string[] = [];
  const { forecast } = weatherData;

  const minTemp = Math.min(...forecast.map((day) => day.tempMin));
  if (minTemp < 5) {
    alerts.push("Frost risk: Temperatures may drop below freezing.");
  } else if (minTemp < 10) {
    alerts.push("Cold risk: Temperatures may drop below 10°C.");
  }

  const dryDays = forecast.filter((day) => (day.rainfall || 0) < 2).length;
  if (dryDays >= 5) {
    alerts.push("Drought risk: Little to no rain expected for 5+ days.");
  }

  const heavyRainDays = forecast.filter((day) => (day.rainfall || 0) > 50).length;
  if (heavyRainDays > 0) {
    alerts.push("Flood risk: Heavy rainfall expected (>50mm/day).");
  }

  const maxTemp = Math.max(...forecast.map((day) => day.tempMax));
  if (maxTemp > 35) {
    alerts.push("Heat risk: Extremely high temperatures expected.");
  }

  return alerts;
}

function generateCropRecommendations(weatherData: WeatherData): Record<string, string> {
  const { current, forecast } = weatherData;
  const avgTemp = forecast.reduce((sum, day) => sum + ((day.tempMax + day.tempMin) / 2), 0) / forecast.length;
  const avgHumidity = forecast.reduce((sum, day) => sum + (day.humidity || current.humidity), 0) / forecast.length;

  const recommendations: Record<string, string> = {};

  if (avgTemp >= 20 && avgTemp <= 28 && avgHumidity <= 80) {
    recommendations.maize = "Optimal conditions for maize growth.";
  } else if (avgTemp < 15) {
    recommendations.maize = "Too cold for maize. Consider waiting.";
  } else {
    recommendations.maize = "Suboptimal conditions for maize.";
  }

  if (avgTemp >= 18 && avgTemp <= 25) {
    recommendations.tea = "Good temperature range for tea cultivation.";
  } else {
    recommendations.tea = "Temperature outside ideal range for tea.";
  }

  if (avgTemp >= 17 && avgTemp <= 23 && avgHumidity <= 70) {
    recommendations.coffee = "Optimal conditions for coffee.";
  } else {
    recommendations.coffee = "Conditions may stress coffee plants.";
  }

  if (avgTemp >= 20 && avgTemp <= 25 && avgHumidity <= 80) {
    recommendations.tomatoes = "Good conditions for tomato growth.";
  } else if (avgHumidity > 80) {
    recommendations.tomatoes = "High humidity increases disease risk for tomatoes.";
  } else {
    recommendations.tomatoes = "Temperature outside ideal range for tomatoes.";
  }

  if (avgTemp >= 15 && avgTemp <= 20 && avgHumidity <= 70) {
    recommendations.potatoes = "Optimal conditions for potato growth.";
  } else if (avgTemp > 25) {
    recommendations.potatoes = "Too warm for optimal potato development.";
  } else {
    recommendations.potatoes = "Conditions may affect potato yield.";
  }

  return recommendations;
}