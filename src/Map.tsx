import React from 'react';
import { pointToTile, tileToBBOX } from '@mapbox/tilebelt'
import getData from './lib/getdata';
import img from './lib/plane.png'
import style from './lib/style.json'

declare global {
  interface Window {
    geolonia: any;
  }
}

interface Props {
    className?: string;
    resolution: number;
}

const interval = 30000

const popup = new window.geolonia.Popup({
  closeButton: false,
  closeOnClick: true,
})

const Component = (props: Props) => {
  const mapContainer = React.useRef<HTMLDivElement>(null)

  const [map, setMap] = React.useState<any>()

  const handleAirplaneClick = React.useCallback((event: any) => {
    const lnglat = event.features[0].geometry.coordinates
    const [lng, lat] = Object.values(lnglat)
    const tile = pointToTile(lng, lat, props.resolution)

    let altitude = 0
    if (0 <= event.features[0].properties.altitude) {
      altitude = event.features[0].properties.altitude
    }

    const f = Math.floor( altitude / ( 2 ** 25 / 2 ** props.resolution ) )

    const tilenum = `/${tile[2]}/${f}/${tile[0]}/${tile[1]}`

    const table = `<table class="popup-table">
      <tr><th>Latitude</th><td>${lat}</td></tr>
      <tr><th>Longitude</th><td>${lng}</td></tr>
      <tr><th>Altitude</th><td>${new Intl.NumberFormat().format(altitude)}m</td></tr>
      <tr><th>Tile</th><td>${tilenum}</td></tr>
    </table>`

    popup.setLngLat(lnglat)
      .setHTML(table)
      .addTo(event.target)
  }, [props.resolution])

  React.useEffect(() => {
    if (! map) {
      return
    }

    map.on("mouseenter", "opensky-network-airplanes", handleAirplaneClick)

    return () => {
      map.off("mouseenter", "opensky-network-airplanes", handleAirplaneClick)
    }
  }, [map, handleAirplaneClick])

  const handleMousemove = React.useCallback((event: any) => {
    const lnglat = event.lngLat
    const [lng, lat] = Object.values(lnglat)
    const tile = pointToTile(lng, lat, props.resolution)
    const bbox = tileToBBOX(tile)

    const geojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [bbox[0], bbox[1]],
                [bbox[2], bbox[1]],
                [bbox[2], bbox[3]],
                [bbox[0], bbox[3]],
                [bbox[0], bbox[1]]
              ]
            ]
          }
        }
      ]
    }

    event.target.getSource("bbox").setData(geojson);
  }, [props.resolution])

  React.useEffect(() => {
    if (! map) {
      return
    }

    map.on("mousemove", handleMousemove)

    return () => {
      map.off("mousemove", handleMousemove)
    }
  }, [map, handleMousemove])

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
          map.getSource("opensky-network").setData(data);
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

        map.on("mousemove", handleMousemove)

        map.on("mouseenter", "opensky-network-airplanes", handleAirplaneClick)
        map.on("mouseleave", "opensky-network-airplanes", () => {
          popup.remove()
        })

        setMap(map)
      }) // End `map.loadImage()`
    })
  }, [mapContainer])

  return (
    <div className={props.className} ref={mapContainer} data-navigation-control="on" data-gesture-handling="off"></div>
  );
}

export default Component;