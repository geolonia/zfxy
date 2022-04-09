import React from 'react';

import Map from './Map'
import Range from './Range'

import './App.scss';

const defaultResolution = 10

const App = () => {
  const [resolution, setResolution] = React.useState<number>(defaultResolution)

  return (
    <div className="App">
      <Map className="map" resolution={resolution} />
      <Range className="range" callback={setResolution} value={resolution} />
      <div id="loading">Loading...</div>
    </div>
  );
}

export default App;
