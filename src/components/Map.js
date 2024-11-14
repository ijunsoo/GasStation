import React, { useEffect, useRef } from 'react';
import './Map.css';

const Map = ({ position, setPosition, stations, handleMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

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
            center: new window.kakao.maps.LatLng(position.lat, position.lng),
            level: 3,
          };
          mapInstance.current = new window.kakao.maps.Map(container, options);

          // 현재 위치 마커 설정 (파란색)
          const currentMarkerImage = new window.kakao.maps.MarkerImage(
            'https://yourdomain.com/path/to/blue-marker.png', // 파란색 마커 이미지 URL로 교체 필요
            new window.kakao.maps.Size(32, 32),
            { offset: new window.kakao.maps.Point(16, 32) }
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

          // 주유소 마커 설정 (초록색)
          const stationMarkerImage = new window.kakao.maps.MarkerImage(
            'C:\Users\ijunsu\Desktop\ijunsu\github\GasStation/green-pin-with-pin-it_136558-84685-removebg-preview.png', // 초록색 마커 이미지 URL로 교체 필요
            new window.kakao.maps.Size(32, 32),
            { offset: new window.kakao.maps.Point(16, 32) }
          );

          stations.forEach((station) => {
            const stationPosition = new window.kakao.maps.LatLng(station.latitude, station.longitude);
            const stationMarker = new window.kakao.maps.Marker({
              position: stationPosition,
              map: mapInstance.current,
              title: station.name,
              image: stationMarkerImage,
            });

            // 주유소 마커 클릭 시 정보 표시
            window.kakao.maps.event.addListener(stationMarker, 'click', () => {
              handleMarkerClick(station);
            });
          });
        });
      } else {
        console.error("Kakao Maps API 로드 실패");
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
  }, [position, stations, setPosition, handleMarkerClick]);

  return <div id="map" ref={mapRef} className="map"></div>;
};

export default Map;
