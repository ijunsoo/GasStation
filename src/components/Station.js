import React from 'react';

const Station = ({ gasStations }) => {
  return (
    <div className="stations">
      <h3>주유소 목록</h3>
      {gasStations.length > 0 ? (
        <ul>
          {gasStations.map((station, index) => (
            <li key={index}>{station.name} - {station.price}</li>
          ))}
        </ul>
      ) : (
        <p>주유소 데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default Station;
