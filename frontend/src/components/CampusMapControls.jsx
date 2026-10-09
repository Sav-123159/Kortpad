import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function CampusMapControls({
    bounds,
    focusPoint,
    focusRequest = 0
}) {
    const leafletMap = useMap();

    const south = bounds[0][0];
    const west = bounds[0][1];
    const north = bounds[1][0];
    const east = bounds[1][1];

    const latitude = focusPoint?.[0];
    const longitude = focusPoint?.[1];

    useEffect(() => {
        const imageBounds = [[south, west], [north, east]];
        let initialized = false;

        function updateSize() {
            const container = leafletMap.getContainer();

            if (!container.clientWidth || !container.clientHeight) {
                return;
            }

            leafletMap.invalidateSize({
                pan: false,
                animate: false
            });

            // CRS.Simple: image dimensions double per zoom level.
            const imageWidth = east - west;
            const imageHeight = north - south;

            const minimumZoom = Math.log2(Math.max(
                container.clientWidth / imageWidth,
                container.clientHeight / imageHeight
            ));

            leafletMap.setMinZoom(minimumZoom);
            leafletMap.setMaxBounds(imageBounds);

            if (!initialized) {
                leafletMap.fitBounds(imageBounds, { animate: false });
                initialized = true;
            }

            leafletMap.panInsideBounds(imageBounds, {
                animate: false
            });
        }

        const observer = new ResizeObserver(updateSize);
        observer.observe(leafletMap.getContainer());
        updateSize();

        return () => observer.disconnect();
    }, [leafletMap, south, west, north, east]);

    useEffect(() => {
        if (
            focusRequest <= 0 ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return;
        }

        // Zoom 0 is a closer view for your campus coordinates.
        const zoom = Math.max(leafletMap.getMinZoom(), 0);

        leafletMap.setView(
            [latitude, longitude],
            zoom,
            { animate: false }
        );
    }, [leafletMap, focusRequest, latitude, longitude]);

    return null;
}
