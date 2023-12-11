import { Feature, GeoJSON } from 'geojson'

const DATA_URL = "https://u6bd7qvpljo3wvnfr3g3gcij7m0ujlkm.lambda-url.ap-northeast-1.on.aws/13";

const getData = async () => {
  const res = await fetch(DATA_URL);
  return await res.json();
}

export default getData;
