"use client"
import React, { useEffect } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { info } from 'console';
import { stat } from 'fs';

interface Location {
    latitude: number;
    longitude: number;
}

const Map = ({currentLocation, stations}: {currentLocation?: Location, stations?: any[]}) => {

    const mapRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initMap = async () => {
            console.log("Map init")
            const loader = new Loader({ 
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
                version: "weekly",
            });

            const { Map } = await loader.importLibrary('maps');
            const { Marker } = await loader.importLibrary('marker');
            const { InfoWindow } = await loader.importLibrary("maps");

            // const position = {
            //     lat: currentLocation.latitude, 
            //     lng: currentLocation.longitude,
            // }
            

            // map options
            const mapOptions: google.maps.MapOptions = {
                center: { lat: -46.7749, lng: -102.4194 },
                zoom: 5,
                // mapId: 'Map.DEMO_MAP_ID',
            }

            // Setup the map
            const map = new Map(mapRef.current as HTMLDivElement, mapOptions);

            if (stations){

            stations.forEach((station) => {
                console.log("Station:", station);
                const stationPosition = {
                    lat: station.latitude,
                    lng: station.longitude,
                }
                let markerIcon = station.discount === 0
                ? {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Default red marker
                }
                : {
                    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png", // Bright green marker for stations with discount
                };

                const marker = new Marker({
                    map: map,
                    position: stationPosition,
                    icon:  markerIcon
                    
                });

                const infowindow = new InfoWindow({
                    content: `
<div style="
    min-width: 250px;
    min-height: auto;
    width: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-family: Arial, sans-serif;
    position: relative;
    margin: 0;
">
    <span style="color: #333; font-size: 1rem; font-weight: bold; margin-bottom: 0.5rem;">
        Station: ${station.name}
    </span>
    <span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">
        Owner: ${station.owner}
    </span>
    <span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">
        Open Slots: ${station.max_capacity - station.reserved - station.current_users}/${station.max_capacity}
    </span>
    <span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">
        Longitude: ${station.longitude}
    </span>
    <span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">
        Latitude: ${station.latitude}
    </span>
    <span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">
        Carbon Dioxide Saved Here: ${station.carbon_saved} Kgs
    </span>
    ${station.discount === 0 ? '' : '<span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">Discount:' + station.discount + '$/kWh</span>'}
    <span style="color: #555; font-size: 0.9rem; margin-bottom: 0.3rem;">
        Charge Rate: ${station.cost_rate - station.discount}$/kWh 
    </span>
${station.discount === 0 ? '' : '<span style="color: #333; font-weight: bold; font-size: 0.6rem; margin-bottom: 0.3rem;">* Note the discount is already applied</span>'}
    <a 
        href="https://www.google.com/maps/dir/?api=1&origin=${-46},${-100}&destination=${station.latitude},${station.longitude}" 
        target="_blank" 
        style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #007BFF;
            color: white;
            font-size: 0.9rem;
            font-weight: bold;
            text-decoration: none;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            display: inline-block;
            text-align: center;
        "
        onmouseover="this.style.backgroundColor='#0056b3';"
        onmouseout="this.style.backgroundColor='#007BFF';"
    >
        Get Directions
    </a>
</div>
                    `,
                });

                marker.addListener("click", () => {
                    infowindow.open(map, marker);
                });

            });


            const image = "/car-svgrepo-com (1).svg";
            // put up a marker

        }
    }
        initMap();

    }, []);


    return (
        <div className="h-4/6 w-[900px]" ref={mapRef} />
  )
}

export default Map
