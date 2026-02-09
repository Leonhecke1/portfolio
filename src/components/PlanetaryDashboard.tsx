import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import PlanetCanvas from './Planet3DModel'; // Import PlanetCanvas

interface Planet {
  id: string;
  name: string;
  type: string;
  mass_kg: number;
  diameter_km: number;
  distance_from_sun_au: number;
  orbital_period_days: number;
  surface_temperature_celsius: {
    min: number;
    max: number;
  };
  textureUrl?: string; // Changed from imageUrl to textureUrl
}

const PlanetaryDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [filteredPlanets, setFilteredPlanets] = useState<Planet[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/planets');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Planet[] = await response.json();
        setPlanets(data);
        setFilteredPlanets(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanets();
  }, []);

  useEffect(() => {
    let currentPlanets = [...planets];

    // Apply filter
    if (filterType !== 'all') {
      currentPlanets = currentPlanets.filter(planet => planet.type === filterType);
    }

    // Apply sort
    currentPlanets.sort((a, b) => {
      let valA: any, valB: any;
      if (sortBy === 'name' || sortBy === 'type') {
        valA = a[sortBy].toLowerCase();
        valB = b[sortBy].toLowerCase();
      } else if (sortBy === 'surface_temperature_celsius_min') {
        valA = a.surface_temperature_celsius.min;
        valB = b.surface_temperature_celsius.min;
      } else {
        valA = a[sortBy as keyof Planet];
        valB = b[sortBy as keyof Planet];
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPlanets(currentPlanets);
  }, [planets, filterType, sortBy, sortOrder]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (loading) {
    return <div className="loading-message">{t('dashboard.loading')}</div>;
  }

  if (error) {
    return <div className="error-message">{t('dashboard.error')}: {error}</div>;
  }

  const planetTypes = Array.from(new Set(planets.map(p => p.type)));

  return (
    <section id="planetary-dashboard" className="planetary-dashboard-section section-container">
      <h2 className="section-title">{t('dashboard.title')}</h2>
      <p className="section-subtitle">{t('dashboard.subtitle')}</p>

      <div className="dashboard-controls">
        <div className="control-group">
          <label htmlFor="filterType">{t('dashboard.filterBy')}:</label>
          <select id="filterType" value={filterType} onChange={handleFilterChange}>
            <option value="all">{t('dashboard.allTypes')}</option>
            {planetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sortBy">{t('dashboard.sortBy')}:</label>
          <select id="sortBy" value={sortBy} onChange={handleSortChange}>
            <option value="name">{t('dashboard.planetName')}</option>
            <option value="type">{t('dashboard.planetType')}</option>
            <option value="mass_kg">{t('dashboard.mass')}</option>
            <option value="diameter_km">{t('dashboard.diameter')}</option>
            <option value="distance_from_sun_au">{t('dashboard.distance')}</option>
            <option value="orbital_period_days">{t('dashboard.orbitalPeriod')}</option>
            <option value="surface_temperature_celsius_min">{t('dashboard.minTemp')}</option>
          </select>
          <button className="btn-custom btn-sort-order" onClick={handleSortOrderChange}>
            {sortOrder === 'asc' ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <div className="planet-cards-grid">
        {filteredPlanets.map(planet => (
          <div key={planet.id} className="planet-card">
            {planet.textureUrl && (
              <div className="planet-3d-model-wrapper">
                <PlanetCanvas textureUrl={planet.textureUrl} size={1.2} rotationSpeed={0.003} />
              </div>
            )}
            <h3>{planet.name}</h3>
            <p><strong>{t('dashboard.type')}:</strong> {planet.type}</p>
            <p><strong>{t('dashboard.mass')}:</strong> {planet.mass_kg.toExponential(2)} kg</p>
            <p><strong>{t('dashboard.diameter')}:</strong> {planet.diameter_km.toLocaleString()} km</p>
            <p><strong>{t('dashboard.distance')}:</strong> {planet.distance_from_sun_au} AU</p>
            <p><strong>{t('dashboard.orbitalPeriod')}:</strong> {planet.orbital_period_days.toLocaleString()} {t('dashboard.days')}</p>
            <p><strong>{t('dashboard.temperature')}:</strong> {planet.surface_temperature_celsius.min}°C to {planet.surface_temperature_celsius.max}°C</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlanetaryDashboard;