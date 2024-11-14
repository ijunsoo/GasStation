import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Map from './components/Map';

const App = () => {
  const [position, setPosition] = useState({ lat: 37.5665, lng: 126.9784 });
  const [stations, setStations] = useState([]); // 더미 데이터를 제거
  const [selectedStation, setSelectedStation] = useState(null);
  const [view, setView] = useState('map');
  const [fuelType, setFuelType] = useState('');
  const [filteredStations, setFilteredStations] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);

  // 초기 로드 시 API 데이터 가져오기
  useEffect(() => {
    handleSearch();
  }, []);

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
        x: position.lat,
        y: position.lng,
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
        setStations(jsonResponse.stations || []); // 백엔드 데이터 저장
        setFilteredStations(jsonResponse.stations || []); // 필터된 데이터 업데이트
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
          <ul className="station-list">
            {sortStationsByPrice(filteredStations).map((station) => (
              <li key={station.id}>
                <div className="station-info">
                  <h4>{station.name}</h4>
                  <p className="station-address">주소: {station.address}</p>
                  <p>연료 종류: {station.fuelType}</p>
                </div>
                <div className="station-price">{station.price}원</div>
              </li>
            ))}
          </ul>
          
          {apiResponse && apiResponse.body && Array.isArray(apiResponse.body) && (
  <div style={{ 
    marginTop: '20px', 
    padding: '20px', 
    border: '1px solid #ddd', 
    maxWidth: '600px', 
    marginLeft: 'auto', 
    marginRight: 'auto', 
    backgroundColor: '#f9f9f9', 
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '15px' }}>API 응답 데이터</h3>
    
    {apiResponse.body.map((station, index) => (
      <div key={index} style={{ 
        padding: '15px', 
        marginBottom: '10px', 
        borderBottom: '1px solid #ddd', 
        textAlign: 'left',
        backgroundColor: '#fff', 
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>주유소 이름: {station.name}</p>
        <p style={{ fontSize: '16px', color: '#555' }}>브랜드: {station.brand}</p>
        <p style={{ fontSize: '16px', color: '#007bff', fontWeight: 'bold' }}>가격: {station.price}원</p>
        <p style={{ fontSize: '14px', color: '#666' }}>위도: {station.latitude}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>경도: {station.longitude}</p>
      </div>
    ))}
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
