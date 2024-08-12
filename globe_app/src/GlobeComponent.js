import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';


const GlobeComponent = () => {
  const globeRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [camera, setCamera] = useState(null);


  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .width(window.innerWidth)
      .height(window.innerHeight)
      .backgroundColor("#000000")
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .pointOfView({ lat: 20, lng: 0, altitude: 2 })
      .enablePointerInteraction(true);


    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;


    const locations = [
      { lat: 51.5074, lng: -0.1278, name: "London", image: "london.jpg", description: "London is the capital of England and the United Kingdom." },
      { lat: 28.6139, lng: 77.209, name: "Delhi", image: "delhi.jpg", description: "Delhi is the capital territory of India." },
      { lat: 40.7128, lng: -74.006, name: "New York", image: "newyork.jpg", description: "New York City is known for its skyscrapers." },
    ];


    const gData = locations.map((loc) => ({
      lat: loc.lat,
      lng: loc.lng,
      size: 0.5,
      color: "#FBBC04",
      name: loc.name,
      image: loc.image,
      description: loc.description,
      altitude: 0.2,
    }));


    globe
      .pointsData(gData)
      .pointAltitude((d) => d.altitude)
      .pointColor(() => "#FBBC04")
      .pointRadius((d) => d.size)
      .labelLat((d) => d.lat)
      .labelLng((d) => d.lng)
      .labelText((d) => d.name)
      .labelSize(() => 0.7)
      .labelColor(() => "white")
      .labelResolution(2)
      .pointsTransitionDuration(2000);


    globe.onPointHover((point) => {
      if (point) {
        setInfo({
          name: point.name,
          image: point.image,
          description: point.description,
          lat: point.lat,
          lng: point.lng,
        });
      } else {
        setInfo(null);
      }
    });


    globe.onPointClick(() => {
      globe.controls().autoRotate = false;
    });


    // Set camera reference
    globe.onGlobeReady(() => {
      setCamera(globe.camera());
    });


    return () => {
      globe.controls().autoRotate = false;
      globe.enablePointerInteraction(false);
    };
  }, []);


  const getBubblePosition = () => {
    const { lat, lng } = info || {};
    if (!lat || !lng || !camera) return { top: '0px', left: '0px' };


    // Convert lat/lng to 3D position
    const spherical = new THREE.Spherical(
      1, // Assume radius of the globe
      THREE.MathUtils.degToRad(lat),
      THREE.MathUtils.degToRad(lng)
    );
    const position = new THREE.Vector3().setFromSpherical(spherical);


    // Convert 3D position to screen coordinates
    const projected = position.clone().project(camera);


    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = -(projected.y * 0.5 - 0.5) * window.innerHeight;


    return { top: `${y}px`, left: `${x}px` };
  };


  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={globeRef} style={{ width: '100%', height: '100%' }} />
      {info && (
        <div id="infoBubble" style={{
          position: 'absolute',
          top: getBubblePosition().top,
          left: getBubblePosition().left,
          padding: '10px',
          backgroundColor: 'white',
          border: '1px solid black',
          borderRadius: '8px',
          zIndex: 1000,
          maxWidth: '300px',
          transform: 'translate(-50%, -100%)'
        }}>
          <h3>{info.name}</h3>
          <img src={info.image} alt={info.name} style={{ width: '200px', height: '150px' }} />
          <p>{info.description}</p>
        </div>
      )}
    </div>
  );
};


export default GlobeComponent;



