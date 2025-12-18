import { useEffect, useRef } from "react";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import FullScreen from "leaflet.fullscreen";

const CountryMap = ({ latlng, geoJsonFeature }) => {
    function FullscreenControl() {
        const map = useMap();
        const hasAddedControl = useRef(false);

        useEffect(() => {
            if (hasAddedControl.current) return;

            map.addControl(
                new FullScreen({
                    position: "topright",
                    forceSeparateButton: true,
                })
            );

            hasAddedControl.current = true;
        }, [map]);

        return null;
    }

    return (
        <div>
            <h3 className="text-center text-xl font-semibold">Map</h3>
            <div className="w-full h-64 rounded-lg overflow-hidden">
                <MapContainer center={latlng} zoom={5} className="h-full w-full">
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                    />{" "}
                    <GeoJSON
                        data={geoJsonFeature}
                        style={{
                            color: "blue",
                            weight: 2,
                            opacity: 1,
                            fillColor: "blue",
                            fillOpacity: 0.2,
                        }}
                    />
                    <FullscreenControl />
                </MapContainer>
            </div>
        </div>
    );
};

export default CountryMap;
