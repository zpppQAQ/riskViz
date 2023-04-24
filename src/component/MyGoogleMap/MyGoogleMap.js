
import React from 'react';
import { GoogleMap, useLoadScript, InfoWindow } from '@react-google-maps/api';
import {useState } from 'react';
import classes from './MyGoogleMap.module.css'
import { Marker } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid';


const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 46.1351,
  lng: -60.1831
};

function MyGoogleMap(props) {
  const [selectedDecade, setSelectedDecade] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    language: 'en',
  });

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  const decadeChangeHandler = (e)=>{
    props.onYearSelected(e.target.value);
    setSelectedDecade(e.target.value);
  
    
  };
  const icons = {
    'low': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    'mid': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    'high': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  };
  function getRiskRating(rating) {
    if (rating < 0.25) {
      return 'low';
    } else if (rating > 0.75) {
      return 'high';
    } else {
      return 'mid';
    }
  };
  const filterRisking = props.data.filter((item) => !selectedDecade || item.Year === selectedDecade)
  .map((item) => {
    return {
      ...item,
      riskRating: parseFloat(item['Risk Rating']),
    };
  });
  const onMarkerClick = (item) => {
    const samePositionItems = filterRisking.filter(
      (i) =>
        parseFloat(i.Lat).toFixed(6) === parseFloat(item.Lat).toFixed(6) &&
        parseFloat(i.Long).toFixed(6) === parseFloat(item.Long).toFixed(6)
    );
    setInfoWindow({ position: item, items: samePositionItems });
  };
  const redMark = "/redDot.png";
  const yellowMark = "/yellowDot.png";
  const greenMark = "/greenDot.png";
  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}>
        {filterRisking.map((item) => (
          <Marker key={uuidv4()} 
          position={{ lat: parseFloat(item.Lat), lng: parseFloat(item.Long) }}
          icon={{
            url: icons[getRiskRating(item.riskRating)],
            scaledSize: new window.google.maps.Size(32,32)
          }}
          onClick={() => onMarkerClick(item)}/>
        ))}
        {infoWindow && (
          <InfoWindow
            position={{
              lat: parseFloat(infoWindow.position.Lat),
              lng: parseFloat(infoWindow.position.Long),
            }}
            onCloseClick={() => setInfoWindow(null)}
          >
            <div style={{ width: '250px', maxHeight: '200px', overflowY: 'scroll' }}>
              {infoWindow.items.map((item, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <h4>{item['Asset Name']}</h4>
                  <p>{item['Business Category']}</p>
                </div>
              ))}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <select className={classes.controller} id="decade-select" onChange={decadeChangeHandler}>
        <option value="">Select a decade</option>
        <option value="2030">2030</option>
        <option value="2040">2040</option>
        <option value="2050">2050</option>
        <option value="2060">2060</option>
        <option value="2070">2070</option>
        <option value="2080">2080</option>
      </select>
      <div className={classes.markInfo}>
        <h2 className={classes.taCenter}>Attendtion!</h2>
        <div className={classes.attentionInfoWrapper}>
          <div>
            <img src={redMark} alt="redMark" />
            <span>Risk Rating &gt;= 0.75</span>
          </div>
          <div>
            <img src={yellowMark} alt="yellowMark" />
            <span>0.25 &lt;= Risk Rating &lt;= 0.75</span>
          </div>
          <div>
            <img src={greenMark} alt="greenMark" />
            <span>Risk Rating &lt;= 0.25</span>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default MyGoogleMap;