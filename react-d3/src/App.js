import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { D3Container } from './d3';

const data = {
  type: 'symbolTriangle',
  data: [[0, 0], [0, 850], [0, -850], [850, 0], [-850, 0]],
  isDraggable: true,
  isResizable: false
};
const d3magic = new D3Container();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export const App = () => {
  const d3Container = useRef(null);
  const [d, setData] = useState(data.data);

  useEffect(() => {
    d3magic.init(d3Container.current);
  }, []);

  useEffect(() => {
    d3magic.draw(d);
  }, [d]);

  const handleClick = () => {
    const newPoint = [
      getRandomArbitrary(-1000, 1000),
      getRandomArbitrary(-1000, 1000)
    ];
    setData([...d, newPoint]);
  };

  const handleReset = () => {};

  return (
    <div className="App">
      <h1>SVG</h1>
      <button onClick={handleClick}>ADD</button>
      <button onClick={handleReset}>RESET</button>
      <div
        style={{ width: '100%', height: '800px' }}
        className="d3-component"
        ref={d3Container}
      />
    </div>
  );
};
