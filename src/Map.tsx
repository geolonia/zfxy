import { Space } from '@spatial-id/javascript-sdk';
import React from 'react';

import getData from './lib/getdata';
import img from './lib/plane.png'
import style from './lib/style.json'

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
  const mapContainer = React.useRef<HTMLDivElement>(null)
  const popupContainer = React.useRef<HTMLDivElement>(null)

  const [map, setMap] = React.useState<any>()
  const [lat, setLat] = React.useState<number>(0)
  const [lng, setLng] = React.useState<number>(0)
  const [alt, setAlt] = React.useState<number>(0)
  const [tilenum, setTileNum] = React.useState<string>()
  const [zfxy, setZfxy] = React.useState<string>("0")

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

  const handleAirplaneClick = React.useCallback((event: any) => {
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

  React.useEffect(() => {
    if (! map) {
      return
    }

    map.on("click", "opensky-network-airplanes", handleAirplaneClick)

    return () => {
      map.off("click", "opensky-network-airplanes", handleAirplaneClick)
    }
  }, [map, handleAirplaneClick])

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (! popupContainer.current) {
      return
    }

    popup.setHTML(popupContainer.current.innerHTML)
  }, [tilenum, zfxy])

  React.useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      style: style,
      hash: true,
    })

    map.on("load", () => {
      map.loadImage(img, async (error: any, image: HTMLImageElement) => {
        if (error) throw error;

        map.addImage("icon", image)
        const data = await getData()

        const loading = document.getElementById('loading')
        if (loading) {
          loading.style.display = 'none'
        }

        map.getSource("opensky-network").setData(data)

        setInterval(async () => {
          const data = await getData()
          map.getSource("opensky-network").setData(data)
        }, interval)

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

        map.on('move', () => {
          const bearing = 360 - map.getBearing()
          map.setLayoutProperty('opensky-network-airplanes', 'icon-rotate', ['+', ['get', 'degree'], bearing])
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
