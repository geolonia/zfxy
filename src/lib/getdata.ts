import { Feature } from 'geojson'

const DATA_URL = "https://u6bd7qvpljo3wvnfr3g3gcij7m0ujlkm.lambda-url.ap-northeast-1.on.aws";

async function getData(tilehashes: string[]): Promise<Feature[]> {
  const allRes = await Promise.all(
    tilehashes.map(tilehash => fetch(DATA_URL + "/" + tilehash).then(res => res.json()))
  );
  return allRes.reduce((acc, cur) => {
    return acc.concat(cur.features);
  }, []);
}

export default getData;
