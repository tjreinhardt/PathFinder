// import collect from '@turf/collect';
// import * as turf from '@turf/turf'

// collect(turf.points, turf.polys, 'population', 'populationValues');
import * as React from 'react';
import { useState, useMemo } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import Pin from './Pin'
import { GeolocateControl } from 'react-map-gl';
import './Map.css'
import { useSelector } from 'react-redux';
import { getAllEventsThunk } from '../../store/event';
import Geocoder from './Geocoder';
import NavBar from '../NavBar';
import { rsvpEventThunk } from "../../store/event";
// import EventDetail from '../events/EventDetail';
import { NavLink } from 'react-router-dom';
import { getEventDetailThunk } from '../../store/event';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidGpyZWluaGFyZHQiLCJhIjoiY2w4MHJyMzI1MDh6bDN2cnU1dzQwZGZobCJ9.f93BsV65IIUxtBJkbiiqXg'; // Set your mapbox token here


export default function MapGL() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [viewState, setViewState] = React.useState({
    longitude: -100,
    latitude: 40,
    zoom: 3.5
  });
  const { eventId } = useParams();
  const { rsvpStatus } = useParams();
  const mapRef = React.useRef()
  const [popupInfo, setPopupInfo] = useState(null);
  const [newLocation, setNewLocation] = useState(null);
  const eventsList = useSelector(state => state.event);
  const session = useSelector(state => state.session.user);
  const [eventIsLoaded, setEventIsLoaded] = useState(false);
  const events = Object.values(eventsList)
  const event = useSelector(state => state.event[eventId]);


  // const onMapLoad = React.useCallback(() => {
  //   mapRef.current.on('style.load', () => {
  //     mapRef.current.setFog({
  //       "range": [0.8, 8],
  //       "color": "#dc9f9f",
  //       "horizon-blend": 0.5,
  //       "high-color": "#245bde",
  //       "space-color": "#000000",
  //       "star-intensity": 0.15
  //     })
  //   })
  // }, [])



  const pins = useMemo(
    () =>
      events.map((event, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={event.lng}
          latitude={event.lat}
          anchor="bottom"

          // draggable={true}

          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo({ ...event })
          }}
        >
          <Pin />
        </Marker>
      )),
    [events, event, popupInfo]
  )


  const createFeatureCollection = (eventsArray) => {
    return {
      "type": "FeatureCollection",
      "features": eventsArray.map((dbEvent) => {
        return {
          "type": "Feature",
          "properties": {
            "url": dbEvent.imageUrl,
            "title": dbEvent.title,
            "body": dbEvent.description,
            "userId": dbEvent.userId
          },
          "geometry": {
            "type": "Point",
            "coordinates": [dbEvent.lng, dbEvent.lat]
          }
        }
      })
    }
  }


  const handleRsvps = async (eventId) => {
    setPopupInfo(null)
    dispatch(rsvpEventThunk(eventId))
    window.alert("RSVP updated")
  }

  let showButton = false
  if (eventIsLoaded && event && (session.id === event.userId)) {
    showButton = true
  }




  React.useEffect(() => {
    dispatch(getAllEventsThunk())
  }, [dispatch, event, rsvpEventThunk, popupInfo])

  React.useEffect(() => {
    createFeatureCollection(events)
  }, [events, event])


  return (
    <>
      <NavBar />
      <Map
        ref={mapRef}
        // onLoad={onMapLoad}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ position: "fixed", height: '89.1%', width: '100%', marginTop: "80px", backgroundImage: `url(https://wallpaperaccess.com/full/2401680.jpg)`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}

        mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
        projection="globe"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          onGeolocate={(position) => {
            // get latitude and longitude of user current location
            setNewLocation([position.coords.latitude, position.coords.longitude]);
          }}
        />
        {pins}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.lng)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
            style={{ padding: '0px', margin: '0px' }}

          >
            <div className="popup-info-container" style={{ position: 'relative', width: '13rem', height: '13rem', backgroundImage: `url(${popupInfo.imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
              <div style={{ position: 'absolute', bottom: '0', color: 'white', backgroundColor: 'black', width: '100%', margin: '10px 10px 15px', marginBottom: '0px', fontSize: '20px' }}>
                <NavLink to={`/events/${popupInfo.id}`} className='popup-name-navlink'>
                  {popupInfo.name}
                </NavLink>
                {/* {popupInfo.description} */}
                <br />
                {popupInfo.totalRsvps} {(popupInfo.totalRsvps) !== 1 ? "others attending" : "other attending"}
                <br />

                <div style={{ marginLeft: 'auto', marginRight: '100%' }}>
                  <div style={{ marginLeft: '30px' }} className="event-rsvp-buttons" onClick={() => handleRsvps(popupInfo.id)}>
                    {popupInfo.rsvpStatus === 1 ?
                      <button style={{ height: '35px', width: '150px' }}>Cancel RSVP</button>
                      :
                      <button style={{ height: '35px', width: '150px' }}>RSVP</button>
                    }
                  </div>

                  {/* <div>{!!event.totalRsvps && (event.totalRsvps === 1 ? <p>1 rsvp</p> : <p>{event.totalRsvps} rsvps</p>)}</div> */}
                </div>



                {/* </div> */}
                {/* Longitude: {popupInfo.lng} */}

                {/* <br /> */}
                {/* Latitude: {popupInfo.lat} */}
              </div>
              {/* <br /> */}
              {/* <br /> */}
              {/* <br /> */}
              {/* <br /> */}
              {/* <img className="map-event-popup" width="100%" height="100%" src={popupInfo.eventUrl} alt="" /> */}
              {/* <EventDetail /> */}
            </div>
          </Popup>
        )}
        <Geocoder />
      </Map>
    </>
  );
}
