import { Space } from '@spatial-id/javascript-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

import getData from './lib/getdata';
import img from './lib/plane.png'
import style from './lib/style.json'
import { Polygon } from 'geojson';

declare global {
  interface Window {
    geolonia: any;
  }
}

interface Props {
  id?: string;
  className?: string;
  resolution: number;
}

const interval = 30000

// @ts-ignore
const popup = new window.geolonia.Popup({
  closeButton: false,
  closeOnClick: true,
})

const Component = (props: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const popupContainer = useRef<HTMLDivElement>(null)

  const [map, setMap] = useState<any>()
  const [lat, setLat] = useState<number>(0)
  const [lng, setLng] = useState<number>(0)
  const [alt, setAlt] = useState<number>(0)
  const [tilenum, setTileNum] = useState<string>()
  const [zfxy, setZfxy] = useState<string>("0")

  const showBbox = (map: any, geom: any) => {
    const geojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": geom
        }
      ]
    }

    map.getSource("bbox").setData(geojson);
  }

  const handleAirplaneClick = useCallback((event: any) => {
    if (!popupContainer.current) {
      return
    }

    const [lng, lat] = event.features[0].geometry.coordinates as [number, number]

    let altitude = 0
    if (0 <= event.features[0].properties.altitude) {
      altitude = event.features[0].properties.altitude
    }

    const space = new Space({lng, lat, alt: altitude}, props.resolution)

    const tilenum = space.zfxyStr
    const zfxy = space.tilehash

    setLat(lat)
    setLng(lng)
    setAlt(altitude)
    setTileNum(tilenum)
    setZfxy(zfxy)

    popup.setLngLat([lng, lat])
      .setHTML(popupContainer.current.innerHTML)
      .addTo(event.target)

    showBbox(event.target, space.toGeoJSON())
  }, [props.resolution])

  useEffect(() => {
    if (! map) {
      return
    }

    map.on("click", "opensky-network-airplanes", handleAirplaneClick)

    return () => {
      map.off("click", "opensky-network-airplanes", handleAirplaneClick)
    }
  }, [map, handleAirplaneClick])

  useEffect(() => {
    if (! popupContainer.current || ! map) {
      return
    }

    const space = new Space({lng, lat, alt}, props.resolution)

    const tilenum = space.zfxyStr
    const zfxy = space.tilehash

    setTileNum(tilenum)
    setZfxy(zfxy)

    showBbox(map, space.toGeoJSON())
  }, [props.resolution, lng, lat, alt, map])

  useEffect(() => {
    if (! popupContainer.current) {
      return
    }

    popup.setHTML(popupContainer.current.innerHTML)
  }, [tilenum, zfxy])

  useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      style: style,
      hash: true,
    });

    (window as any)._mainMap = map;

    map.on("load", () => {
      map.loadImage(img, async (error: any, image: HTMLImageElement) => {
        if (error) throw error;

        map.addImage("icon", image)

        let timeoutId: number | undefined = undefined;

        const performLoad = async () => {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = undefined;
          }

          const currentBounds = map.getBounds();
          const boundingGeom: Polygon = {
            type: "Polygon",
            coordinates: [
              [
                [currentBounds.getWest(), currentBounds.getNorth()],
                [currentBounds.getEast(), currentBounds.getNorth()],
                [currentBounds.getEast(), currentBounds.getSouth()],
                [currentBounds.getWest(), currentBounds.getSouth()],
                [currentBounds.getWest(), currentBounds.getNorth()],
              ],
            ]
          };
          const spaces = Space.spacesForGeometry(boundingGeom, Math.max(Math.ceil(map.getZoom()) - 1, 1));
          const spaceTilehashes = Array.from(new Set(spaces.map((space) => space.tilehash)));
          console.log(spaceTilehashes);
          const data = await getData(spaceTilehashes);
          const loading = document.getElementById('loading')
          if (loading) {
            loading.style.display = 'none'
          }
          map.getSource("opensky-network").updateData({ add: data });
          timeoutId = window.setTimeout(performLoad, interval);
        };

        performLoad();

        // クラスターをクリックで展開
        map.on("click", "clusters", (event: any) => {
          const features = map.queryRenderedFeatures(event.point, { layers: ["clusters"] });
          const clusterId = features[0].properties.cluster_id;
          map.getSource("opensky-network").getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err)
              return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom + 1,
            });
          });
        });

        map.on("mouseover", "clusters", (event: any) => {
          map.getCanvas().style.cursor = "pointer"
        })

        map.on("mouseleave", "clusters", (event: any) => {
          map.getCanvas().style.cursor = "all-scroll"
        })

        map.on("mouseover", "opensky-network-airplanes", (event: any) => {
          map.getCanvas().style.cursor = "pointer"
        })

        map.on("mouseleave", "opensky-network-airplanes", (event: any) => {
          map.getCanvas().style.cursor = "all-scroll"
        })

        map.on('moveend', () => {
          performLoad();
        })

        map.on("click", "opensky-network-airplanes", handleAirplaneClick)

        setMap(map)
      }) // End `map.loadImage()`
    })
  }, [mapContainer, handleAirplaneClick])

  return (
    <>
      <div id={props.id} className={props.className} ref={mapContainer} data-navigation-control="on" data-gesture-handling="off"></div>
      <div ref={popupContainer} style={{display: "none"}}>
        <table className="popup-table"><tbody>
          <tr><th>Latitude</th><td>{lat}</td></tr>
          <tr><th>Longitude</th><td>{lng}</td></tr>
          <tr><th>Altitude</th><td>{new Intl.NumberFormat().format(Math.round(alt))}m</td></tr>
          <tr><th>ZFXY</th><td>{tilenum}</td></tr>
          <tr><th>ID</th><td>{zfxy}</td></tr>
        </tbody>
        </table>
      </div>
    </>
  );
}

export default Component;
