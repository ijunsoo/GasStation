import React from 'react';
import './Sidebar.css';

const Sidebar = ({ position, onLocateClick, onSearchClick }) => {
  return (
    <div className="sidebar">
      <h2>현재 위치</h2>
      <button className="button-spacing" onClick={onLocateClick}>현재위치</button>
      <button className="button-spacing" onClick={onSearchClick}>검색</button>
      <p>위도: {position.lat}</p>
      <p>경도: {position.lng}</p>
    </div>
  );
};

export default Sidebar;
