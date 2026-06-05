"use client";
import { useState } from 'react';
import { useLocation } from '../context/LocationContext';

export default function LocationSearch() {
  const { location, setLocation, error, setError } = useLocation();
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('Permission denied');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleCitySearch = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error('Geocode failed');
      const data = await res.json();
      setLocation([data.lat, data.lon]);
      setError(null);
    } catch (e) {
      setError('Unable to find city');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <button
        onClick={handleGeolocation}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? 'Locating...' : 'Use My Location'}
      </button>
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleCitySearch}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          Search
        </button>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
