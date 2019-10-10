import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { D3Container } from './d3';
import * as d3 from 'd3';

const data1 = [
  {
    type: 'symbolCircle',
    data: [[1, 2]],
    isDraggable: true,
    isResizable: false
  },
  {
    type: 'symbolTriangle',
    data: [[0, 0], [0, 850], [0, -850], [850, 0], [-850, 0]],
    isDraggable: true,
    isResizable: false
  },
  {
    type: 'line',
    data: [[1, 2]],
    isDraggable: true,
    isResizable: false
  },
  {
    type: 'contourRect',
    data: [[1, 2]],
    isDraggable: true,
    isResizable: false
  },
  {
    type: 'contourCircle',
    data: [[1, 2]],
    isDraggable: true,
    isResizable: false
  },
  {
    type: 'contourPolygon',
    data: [[1, 2]],
    isDraggable: true,
    isResizable: false
  }
];

const data = {
  type: 'symbolTriangle',
  data: [[0, 0], [0, 850], [0, -850], [850, 0], [-850, 0]],
  isDraggable: true,
  isResizable: false
};

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const d3magic = new D3Container();

export const App = () => {
  const d3Container = useRef(null);
  const [d, setD] = useState(data.data);
  const [t, setT] = useState(null);

  useEffect(() => {
    if (d3Container.current) {
      d3magic.init(d3Container.current, d, t, setT);
    }
  }, [d, t]);

  const handleClick = () => {
    // setState(d3magic.getState())
    // d3magic.showLines
    const newPoint = [
      getRandomArbitrary(-1000, 1000),
      getRandomArbitrary(-1000, 1000)
    ];
    setD([...d, newPoint]);
  };

  return (
    <div className="App">
      <h1>SVG</h1>
      <button onClick={handleClick}>ADD</button>
      <svg
        style={{ width: '100%', height: '800px' }}
        className="d3-component"
        ref={d3Container}
      />
    </div>
  );
};
