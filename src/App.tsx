import React from 'react';

import Map from './Map'
import Range from './Range'

import './App.scss';

const defaultResolution = 10

const App = () => {
  const [resolution, setResolution] = React.useState<number>(defaultResolution)

  const onChangeRange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResolution(Number(event.target.value))
  }

  return (
    <div className="App">
      <Map id="map" resolution={resolution} />
      <Range className="range" onChange={onChangeRange} min={0} max={30} value={resolution} />
      <div id="loading">Loading...</div>
    </div>
  );
}

export default App;
