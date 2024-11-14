import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Map from './components/Map';

const App = () => {
  const [position, setPosition] = useState({ lat: 37.58178222914391, lng: 127.00991747727649 });
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [view, setView] = useState('map');
  const [fuelType, setFuelType] = useState('');
  const [filteredStations, setFilteredStations] = useState([]);
  const [sortOption, setSortOption] = useState('distance');
  const mapRef = useRef(null); // Map 컴포넌트 접근을 위한 참조

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPosition({ lat, lng });
          handleSearch(lat, lng);
        },
        (error) => {
          console.error("위치를 가져오는 데 실패했습니다.", error);
          setPosition({ lat: 37.5665, lng: 126.9784 });
          handleSearch(37.5665, 126.9784);
        }
      );
    } else {
      alert('Geolocation을 사용할 수 없습니다.');
      setPosition({ lat: 37.5665, lng: 126.9784 });
    }
  }, []);

  const handleFuelTypeChange = (type) => {
    setFuelType(type);
    setFilteredStations(
      stations.filter((station) => type === '' || station.fuelType === type)
    );
  };

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  const handleSearch = async (lat, lng) => {
    try {
      const data = {
        x: lat,
        y: lng,
        radius: "5000",
        type: fuelType || '',
      };

      const response = await fetch('http://localhost:8080/api/gas-stations/cheapest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        setStations(jsonResponse.body || []);
        setFilteredStations(jsonResponse.body || []);
        
        // 지도 중심을 검색한 위치로 업데이트
        if (mapRef.current) {
          mapRef.current.recenterMap({ lat, lng });
        }
      } else {
        console.error('데이터를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('서버 요청 중 오류 발생:', error);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getSortedStations = () => {
    const sortedStations = [...filteredStations].sort((a, b) => {
      if (sortOption === 'price') {
        return a.price - b.price;
      } else if (sortOption === 'distance') {
        const distanceA = calculateDistance(position.lat, position.lng, a.latitude, a.longitude);
        const distanceB = calculateDistance(position.lat, position.lng, b.latitude, b.longitude);
        return distanceA - distanceB;
      }
      return 0;
    });
    return sortedStations.slice(0, 10);
  };

  return (
    <div className="app">
      <div className="controls" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <select
          value={fuelType}
          onChange={(e) => handleFuelTypeChange(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          
          <option value="Gasoline">휘발유(가솔린)</option>
          <option value="Diesel">경유(디젤)</option>
        </select>
        
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="distance">거리순</option>
          <option value="price">가격순</option>
        </select>

        <button onClick={() => setView('map')} style={{ marginRight: '5px' }}>지도 보기</button>
        <button onClick={() => setView('list')}>목록 보기</button>
      </div>

      {position && view === 'map' ? (
        <Map
          ref={mapRef} // Map 컴포넌트 참조
          position={position}
          setPosition={setPosition}
          stations={getSortedStations()}
          handleMarkerClick={handleMarkerClick}
        />
      ) : (
        <div>Loading map...</div>
      )}

      {view === 'list' && (
        <div>
          <ul className="station-list">
            {getSortedStations().map((station, index) => (
              <li key={index}>
                <div className="station-info">
                  <h4>{station.name}</h4>
                  <p>브랜드: {station.brand}</p>
                  <p>가격: {station.price}원</p>
                  <p>위도: {station.latitude}</p>
                  <p>경도: {station.longitude}</p>
                  <p>거리: {calculateDistance(position.lat, position.lng, station.latitude, station.longitude).toFixed(2)} km</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {position && (
        <Sidebar
          position={position}
          onLocateClick={() => handleSearch(position.lat, position.lng)}
          onSearchClick={() => handleSearch(position.lat, position.lng)}
          selectedStation={selectedStation}
        />
      )}
    </div>
  );
};

export default App;
