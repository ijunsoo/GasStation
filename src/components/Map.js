import React, { useEffect, useRef } from 'react';
import './Map.css';

const Map = ({ position, setPosition, stations, handleMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 주유소와 현재 위치 간의 거리 계산 함수 (단위: km)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=681868ddca9c534b3d512327465d8ff2&autoload=false`;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(position.lat, position.lng), // 초기 위치를 position으로 설정
            level: 6, // 축소된 상태로 렌더링 (값을 높일수록 축소됨)
          };
          mapInstance.current = new window.kakao.maps.Map(container, options);

          // 현재 위치 마커 설정
          const currentMarkerImage = new window.kakao.maps.MarkerImage(
            'https://github.com/ijunsoo/GasStation/blob/main/src/%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C.jfif?raw=true',
            new window.kakao.maps.Size(32, 32)
          );

          const currentMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(position.lat, position.lng),
            map: mapInstance.current,
            image: currentMarkerImage,
            draggable: true,
          });

          window.kakao.maps.event.addListener(currentMarker, 'dragend', () => {
            const newPosition = currentMarker.getPosition();
            setPosition({
              lat: newPosition.getLat(),
              lng: newPosition.getLng(),
            });
          });

          // 주유소 마커와 마우스 오버 시 표시될 인포윈도우 설정
          const stationMarkerImage = new window.kakao.maps.MarkerImage(
            'https://img.icons8.com/fluency/48/008000/marker.png',
            new window.kakao.maps.Size(32, 32)
          );

          stations.forEach((station) => {
            const stationPosition = new window.kakao.maps.LatLng(station.latitude, station.longitude);
            const stationMarker = new window.kakao.maps.Marker({
              position: stationPosition,
              map: mapInstance.current,
              image: stationMarkerImage,
            });

            // 거리 계산
            const distance = calculateDistance(position.lat, position.lng, station.latitude, station.longitude).toFixed(2);

            // 인포윈도우 설정 (기본적으로 숨김)
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:5px; font-size:14px;">
                  <strong>${station.name}</strong><br/>
                  가격: ${station.price}원<br/>
                  거리: ${distance} km
                </div>
              `,
            });

            // 마커에 마우스 올릴 때 인포윈도우 열기
            window.kakao.maps.event.addListener(stationMarker, 'mouseover', () => {
              infoWindow.open(mapInstance.current, stationMarker);
            });

            // 마커에서 마우스 뗄 때 인포윈도우 닫기
            window.kakao.maps.event.addListener(stationMarker, 'mouseout', () => {
              infoWindow.close();
            });
          });
        });
      }
    };

    return () => {
      if (script) {
        document.head.removeChild(script);
      }
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [position, stations, setPosition]);

  // `position`이 변경될 때마다 지도 중심을 업데이트
  useEffect(() => {
    if (mapInstance.current) {
      const newCenter = new window.kakao.maps.LatLng(position.lat, position.lng);
      mapInstance.current.setCenter(newCenter);
    }
  }, [position]);

  return <div id="map" ref={mapRef} className="map"></div>;
};

export default Map;
