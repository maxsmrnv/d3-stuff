import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { D3Container } from './d3';

const symbols = [
  {
    type: 'symbolCircle',
    data: [[300, 300], [-300, -300],[-300, 300], [300, -300]],
  },
  {
    type: 'symbolTriangle',
    data: [[0, 0], [0, 850], [0, -850], [850, 0], [-850, 0]],
  },
];

const lines = {
    type: 'line',
    data: symbols[0].data.map(v => [[v[0]-150, v[1]],[v[0]+150, v[1]]] ),
  }

  const circleContour = {
    type: 'circleContour',
    x: 0,
    y: 0,
    r: 300
  }

  const rectContour = {
    type: 'rectContour',
    x: -400,
    y: 400,
    w: 400,
    h: 400
  }

  const polyContour = {
    type: 'polyContour',
    points: [[[0,1000],[-800,-900],[1000, -1000]]]

  }

  const contours = [circleContour,rectContour,polyContour]

  const polyLayers = [[[0,-1000],[-1000, -400],[-800,900],[800, 800],[1000, 200]]]


const d3magic = new D3Container();


export const App = () => {
  const d3Container = useRef(null);
  const [symbolsState, setSymbols] = useState(symbols);
  const [linesState, setLines] = useState(lines);
  const [contourState, setContour] = useState(rectContour.type);
  const [polyLayersState, setPolyLayers] = useState(polyLayers);

  useEffect(() => {
    d3magic.init(d3Container.current);
    d3magic.drawPolyLayers(polyLayersState);
    d3magic.drawSymbols(symbolsState);
    d3magic.drawLine(linesState);
  }, []);

  useEffect(() => {
    d3magic.drawContour(contours.find(v => v.type === contourState));
  }, [contourState]);



  const handleReset = () => {
    d3magic.reset()
  };
const handleChangeContour = e => {
  setContour(e.target.value)
}

  return (
    <div className="App">
      <div
        style={{ width: '100%', height: '800px' }}
        ref={d3Container}
      />
      <div>
      <hr/>
      <button onClick={handleReset}>ZOOM PAN RESET</button>
      <hr/>
      {symbolsState.map(v => 
      <h5 key={v.type}>
        {v.type}
        <input readOnly style={{width: '500px'}}  value={JSON.stringify(v.data)}/>
      </h5>
      )}
      <hr/>
      <h5>
        {lines.type}
        <input readOnly style={{width: '500px'}}  value={JSON.stringify(lines.data)}/>
      </h5>
      <hr/>
      <h5>
      Contour
      <br/>
        <select value={contourState} onChange={handleChangeContour}>
          {contours.map(v => <option key={v.type} value={v.type}>{JSON.stringify(v)}</option>)}
        </select>
      </h5>
      <hr/>
      <h5>
        polyLayers
        <input readOnly style={{width: '500px'}}  value={JSON.stringify(polyLayersState)}/>
      </h5>
      <hr/>
      </div>
    </div>
  );
};
