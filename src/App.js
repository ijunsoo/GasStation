import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Map from './components/Map';

const App = () => {
  const [position, setPosition] = useState({ lat: 37.5665, lng: 126.9784 }); // 초기 위치
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

  const [selectedStation, setSelectedStation] = useState(null); // 선택된 주유소 정보
  const [view, setView] = useState('map'); // 현재 화면 보기 모드 (지도 or 목록)
  const [fuelType, setFuelType] = useState(''); // 연료 종류 필터링 상태
  const [filteredStations, setFilteredStations] = useState(stations); // 필터링된 주유소 데이터를 저장할 상태

  // 주유소 이름으로 검색 필터링
  const handleSearchByName = (query) => {
    setFilteredStations(
      stations.filter((station) =>
        station.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  // 연료 종류 필터링
  const handleFuelTypeChange = (type) => {
    setFuelType(type);
    setFilteredStations(
      stations.filter((station) =>
        type === '' || station.fuelType === type
      )
    );
  };

  // 마커 클릭 시 주유소 정보 업데이트
  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  // 최소 가격 주유소 찾기
  const findCheapestStation = () => {
    if (stations.length === 0) return null;
    return stations.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr
    );
  };

  // 검색 버튼 클릭 시 호출될 함수
  const handleSearch = async () => {
    try {
      const data = {
        latitude: position.lat,
        longitude: position.lng,
        radius: 5, // 검색할 반경 (단위: km)
      };

      const response = await fetch('http://서버주소/주유소-검색', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        setStations(jsonResponse.stations); // 서버 응답 데이터로 stations 업데이트
        setFilteredStations(jsonResponse.stations); // 필터링된 주유소 데이터도 업데이트
      } else {
        console.error('데이터를 가져오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('서버 요청 중 오류 발생:', error);
    }
  };

  // 현재 위치 버튼 클릭 시 위치 설정
  const handleLocateClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPosition({ lat, lng });
      });
    } else {
      alert('Geolocation을 사용할 수 없습니다.');
    }
  };

  const cheapestStation = findCheapestStation(); // 최소 가격 주유소 찾기

  // 가격 오름차순 정렬 함수
  const sortStationsByPrice = (stations) => {
    return [...stations].sort((a, b) => a.price - b.price);
  };

  return (
    <div className="app">
      <div className="controls" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="주유소 이름으로 검색"
          onChange={(e) => handleSearchByName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
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
          stations={filteredStations}
          handleMarkerClick={handleMarkerClick}
        />
      ) : (
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
      )}

      <Sidebar
        position={position}
        onLocateClick={handleLocateClick}
        onSearchClick={handleSearch}
        selectedStation={selectedStation}
        cheapestStation={cheapestStation} // 최소 가격 주유소 정보 전달
      />
    </div>
  );
};

export default App;
