import * as d3 from 'd3';

export class D3Container {
  init(selector, data, t, setT) {
    d3.select('svg > *').remove();
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };
    const outerWidth = 800;
    const outerHeight = 800;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    const container = d3.select(selector).attr('border', '1px solid black');

    // Init SVG
    const svgChart = container
      .append('svg:svg')
      .attr('width', outerWidth)
      .attr('height', outerHeight)
      .attr('class', 'svg-plot')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add a clipPath: everything out of this area won't be drawn.

    svgChart
      .append('defs')
      .append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0);

    // Create the scatter variable: where both the circles and the brush take place
    const scatter = svgChart.append('g').attr('clip-path', 'url(#clip)');

    // Init Scales
    const x = d3
      .scaleLinear()
      .domain([-1100, 1100])
      .range([0, width])
      .nice();

    const y = d3
      .scaleLinear()
      .domain([-1100, 1100])
      .range([height, 0])
      .nice();

    // Init Axis
    const xAxis = d3.axisTop(x).tickSize(2);
    const yAxis = d3.axisLeft(y).tickSize(2);

    // Add Axis
    const gxAxis = svgChart.append('g').call(xAxis);

    const gyAxis = svgChart.append('g').call(yAxis);

    // dragging

    function dragstarted() {
      d3.select(this)
        .raise()
        .attr('stroke', 'black');
      scatter.attr('cursor', 'grabbing');
    }

    function dragged(d) {
      d3.select(this)
        .attr('cx', (d.x = d3.event.x))
        .attr('cy', (d.y = d3.event.y));
    }

    function dragended() {
      d3.select(this)
        .raise()
        .attr('stroke', 'none');
      scatter.attr('cursor', 'grab');
    }

    // .attr("viewBox", [0, 0, width, height])
    // .attr("stroke-width", 2);

    // const circles = d3.range(20).map(i => ({
    // x: Math.random() * (width - 22 * 2) + 22,
    // y: Math.random() * (height - 22 * 2) + 22,
    // }));

    // scatter.selectAll("circle")
    // .data(circles)
    // .join("circle")
    // .attr("cx", d => d.x)
    // .attr("cy", d => d.y)
    // .attr("r", 22)
    // .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
    // .call(d3.drag()
    // .on("start", dragstarted)
    // .on("drag", dragged)
    // .on("end", dragended));

    //draw figures

    const draw = data => {
      scatter
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', d3.symbol().type(d3.symbolCross))
        .attr('class', 'points')
        .attr('fill', 'red')
        .attr('transform', d => `translate(${x(d[0])}, ${y(d[1])})`);
      // .call(
      //   d3
      //     .drag()
      //     .on('start', dragstarted)
      //     .on('drag', dragged)
      //     .on('end', dragended)
      // );

      // scatter
      //   .append('circle')
      //   .attr('class', 'contour')
      //   .attr('cx', x(0))
      //   .attr('cy', y(0))
      //   .attr('r', y(100))
      //   .attr('fill', 'none')
      //   .attr('stroke', 'blue');
    };

    draw(data);
    if (t) {
      update(t);
    }

    // data.forEach(v => {
    //   if (v.type === 'symbolTriangle') {
    //     draw(v.data);
    //   }
    // });

    // Update plot on canvas
    function update(transform) {
      setT(transform);
      const scaleX = transform.rescaleX(x);
      const scaleY = transform.rescaleY(y);

      gxAxis.call(xAxis.scale(scaleX));
      gyAxis.call(yAxis.scale(scaleY));

      scatter
        .selectAll('.contour')
        .attr(
          'transform',
          `translate(${transform.x},${transform.y})scale(${transform.k})`
        );
      scatter.selectAll('.points').attr('transform', d => {
        return `translate(
          ${transform.x + x(d[0]) * transform.k},
          ${transform.y + y(d[1]) * transform.k})`;
      });
    }

    // Initial draw made with no zoom
    // update(d3.zoomIdentity);

    // Zoom/Drag handler
    const zoom_function = d3
      .zoom()
      .scaleExtent([-100, 100])
      .on('zoom', () => {
        update(d3.event.transform);
      });

    container.call(zoom_function);
  }
}
