import React, { useEffect, useRef, useState } from 'react';
import './Map.css';

const Map = ({ position, setPosition, stations, handleMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

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

          // 현재 위치 마커
          const currentPosition = new window.kakao.maps.LatLng(position.lat, position.lng);
          const currentMarker = new window.kakao.maps.Marker({
            position: currentPosition,
            draggable: true,
          });
          currentMarker.setMap(mapInstance.current);
          markerRef.current = currentMarker;

          // 마커 드래그 이벤트
          window.kakao.maps.event.addListener(currentMarker, 'dragend', () => {
            const newPosition = currentMarker.getPosition();
            setPosition({
              lat: newPosition.getLat(),
              lng: newPosition.getLng(),
            });
          });

          // 주유소 마커 추가
          stations.forEach((station) => {
            const stationPosition = new window.kakao.maps.LatLng(station.lat, station.lng);
            const stationMarker = new window.kakao.maps.Marker({
              position: stationPosition,
              title: station.name,
            });
            stationMarker.setMap(mapInstance.current);

            // 주유소 마커 클릭 시 정보 표시
            window.kakao.maps.event.addListener(stationMarker, 'click', () => {
              handleMarkerClick(station); // 주유소 클릭 시 정보 업데이트
            });
          });
        });
      } else {
        console.error("Kakao Maps API 로드 실패");
      }
    };

    return () => {
      if (script) {
        script.remove();
      }
      const container = mapRef.current;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [position, stations, setPosition, handleMarkerClick]);

  return (
    <div id="map" ref={mapRef} className="map"></div>
  );
};

export default Map;
