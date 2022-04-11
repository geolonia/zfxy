export type ZFXYTile = [number, number, number, number];

export function getParent(tile: ZFXYTile): ZFXYTile {
  const [f,x,y,z] = tile;
  return [f>>1,x>>1,y>>1,z-1];
}
export function getChildren(tile: ZFXYTile): ZFXYTile[] {
  const [f,x,y,z] = tile;
  return [
    [f * 2,     x * 2,     y * 2,     z+1], // +0, +0, +0
    [f * 2,     x * 2,     y * 2 + 1, z+1], // +0, +0, +1
    [f * 2,     x * 2 + 1, y * 2,     z+1], // +0, +1, +0
    [f * 2,     x * 2 + 1, y * 2 + 1, z+1], // +0, +1, +1
    [f * 2 + 1, x * 2,     y * 2,     z+1], // +1, +0, +0
    [f * 2 + 1, x * 2,     y * 2 + 1, z+1], // +1, +0, +1
    [f * 2 + 1, x * 2 + 1, y * 2,     z+1], // +1, +1, +0
    [f * 2 + 1, x * 2 + 1, y * 2 + 1, z+1], // +1, +1, +1
  ];
}

export function generate(tile: ZFXYTile): string {
  let [z, f, x, y] = tile;
  let out = '';
  while (z>0) {
    const thisTile: ZFXYTile = [f,x,y,z];
    const parent = getParent(thisTile);
    const childrenOfParent = getChildren(parent);
    const positionInParent = childrenOfParent.findIndex(
      // eslint-disable-next-line no-loop-func
      ([xf, xx, xy, xz]) => xf === f && xx === x && xy === y && xz === z
    );
    out = positionInParent.toString(8) + out;
    f = parent[0];
    x = parent[1];
    y = parent[2];
    z = parent[3];
  }
  return out;
}
