import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Map from './components/Map';

const App = () => {
  const [position, setPosition] = useState({ lat: 37.5665, lng: 126.9784 });
  const [stations, setStations] = useState([
    {
      id: 1,
      name: '주유소1',
      fuelType: 'Gasoline',
      price: 1500,
      lat: 37.5675,
      lng: 126.9774,
      address: '서울특별시 중구 세종대로 110',
    },
    {
      id: 2,
      name: '주유소2',
      fuelType: 'Diesel',
      price: 1400,
      lat: 37.565,
      lng: 126.975,
      address: '서울특별시 중구 세종대로 120',
    },
    {
      id: 3,
      name: '주유소3',
      fuelType: 'Premium Gasoline',
      price: 1600,
      lat: 37.563,
      lng: 126.973,
      address: '서울특별시 중구 세종대로 130',
    },
  ]);

  const [selectedStation, setSelectedStation] = useState(null);
  const [view, setView] = useState('map');
  const [fuelType, setFuelType] = useState('');
  const [filteredStations, setFilteredStations] = useState(stations);
  const [apiResponse, setApiResponse] = useState(null);

  // 연료 종류 필터링
  const handleFuelTypeChange = (type) => {
    setFuelType(type);
    setFilteredStations(
      stations.filter((station) => type === '' || station.fuelType === type)
    );
  };

  // 마커 클릭 시 주유소 정보 업데이트
  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  // 최소 가격 주유소 찾기
  const findCheapestStation = () => {
    if (!filteredStations || filteredStations.length === 0) return null;
    return filteredStations.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr
    );
  };

  // 검색 버튼 클릭 시 호출될 함수
  const handleSearch = async () => {
    try {
      const data = {
        x: position.lat, // x로 위도 전달
        y: position.lng, // y로 경도 전달
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
        console.log('백엔드 API 응답:', jsonResponse);
        setStations(jsonResponse.stations || []);
        setFilteredStations(jsonResponse.stations || []);
        setApiResponse(jsonResponse);
      } else {
        console.error('데이터를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('서버 요청 중 오류 발생:', error);
    }
  };

  // 현재 위치 버튼 클릭 시 위치 설정 후 검색 호출
  const handleLocateClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition({ lat, lng });
        handleSearch(); // 위치가 설정된 후에 handleSearch 호출
      });
    } else {
      alert('Geolocation을 사용할 수 없습니다.');
    }
  };

  const cheapestStation = findCheapestStation();

  // 가격 오름차순 정렬 함수
  const sortStationsByPrice = (stations) => {
    if (!stations) return [];
    return [...stations].sort((a, b) => a.price - b.price);
  };

  return (
    <div className="app">
      <div className="controls" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <select
          value={fuelType}
          onChange={(e) => handleFuelTypeChange(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">모든 연료 종류</option>
          <option value="Gasoline">휘발유(가솔린)</option>
          <option value="Diesel">경유(디젤)</option>
          <option value="Premium Gasoline">고급 휘발유</option>
        </select>
        <button onClick={() => setView('map')} style={{ marginRight: '5px' }}>지도 보기</button>
        <button onClick={() => setView('list')}>목록 보기</button>
      </div>

      {view === 'map' ? (
        <Map
          position={position}
          setPosition={setPosition}
          stations={filteredStations || []}
          handleMarkerClick={handleMarkerClick}
        />
      ) : (
        <div>
          <ul className="station-list" style={{ textAlign: 'left', margin: '0 auto', width: '70%' }}>
            {sortStationsByPrice(filteredStations).map((station) => (
              <li key={station.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                <h4>{station.name}</h4>
                <p>주소: {station.address}</p>
                <p>연료 종류: {station.fuelType}</p>
                <p>가격: {station.price}원</p>
              </li>
            ))}
          </ul>
          
          {/* API 응답 데이터를 목록 보기 모드일 때만 화면에 출력 */}
          {apiResponse && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd' }}>
              <h3>API 응답 데이터:</h3>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <Sidebar
        position={position}
        onLocateClick={handleLocateClick}
        onSearchClick={handleSearch}
        selectedStation={selectedStation}
        cheapestStation={cheapestStation}
      />
    </div>
  );
};

export default App;
