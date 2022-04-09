import { Feature, GeoJSON } from 'geojson'

const DATA_URL = "https://opensky-network.org/api/states/all";

const getData = async () => {
  const res = await fetch(DATA_URL)
  const json = await res.json()
  const data = json.states

  const geojson:GeoJSON = {
    "type": "FeatureCollection",
    "features": []
  }

  for (let i = 0; i < data.length; i++) {
    const feature:Feature = {
      "type": "Feature",
      "properties": {
        callsign: data[i][1],
        country: data[i][2],
        degree: data[i][10],
        altitude: data[i][13]
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          data[i][5],
          data[i][6]
        ]
      }
    }

    geojson.features.push(feature)
  }

  return geojson
}

export default getData
