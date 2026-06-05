"use client";
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLocation } from "../context/LocationContext";

// Fix default marker icon issue in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMarker() {
  const { setLocation } = useLocation();
  const [position, setPosition] = useState<[number, number]>([-1.2921, 36.8219]); // default Nairobi

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLocation([lat, lng]);
    },
  });

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return position === null ? null : <Marker position={position} />;
}

export default function SelectLocationPage() {
  const { location } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 dark:from-green-900 dark:to-green-800 p-4">
      <h1 className="text-2xl font-bold text-center text-green-800 dark:text-green-200 mb-4">
        Select a Location
      </h1>
      <div className="flex justify-center">
        <MapContainer
          center={location ?? [-1.2921, 36.8219]}
          zoom={6}
          style={{ height: '70vh', width: '90%', maxWidth: '800px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}
