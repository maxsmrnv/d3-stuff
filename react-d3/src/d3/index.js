import * as d3 from 'd3';

export class D3Container {
  constructor() {
    this.scatter = null;
    this.x = null;
    this.y = null;
    this.transform = null;
    this.update = null;
  }
  init(selector) {
    d3.select('svg > *').remove();
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };
    const outerWidth = 800;
    const outerHeight = 800;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    const container = d3.select(selector);

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

    // Create the this.scatter variable: where both the circles and the brush take place
    this.scatter = svgChart.append('g').attr('clip-path', 'url(#clip)');

    // Init Scales
    this.x = d3
      .scaleLinear()
      .domain([-1100, 1100])
      .range([0, width])
      .nice();

    this.y = d3
      .scaleLinear()
      .domain([-1100, 1100])
      .range([height, 0])
      .nice();

    // Init Axis
    const xAxis = d3.axisTop(this.x).tickSize(2);
    const yAxis = d3.axisLeft(this.y).tickSize(2);

    // Add Axis
    const gxAxis = svgChart.append('g').call(xAxis);
    const gyAxis = svgChart.append('g').call(yAxis);

    // Initial draw made with no zoom
    // update(d3.zoomIdentity);

    // Update plot on canvas
    this.update = transform => {
      this.transform = transform;
      const scaleX = transform.rescaleX(this.x);
      const scaleY = transform.rescaleY(this.y);

      gxAxis.call(xAxis.scale(scaleX));
      gyAxis.call(yAxis.scale(scaleY));

      this.scatter
        .selectAll('.contour')
        .attr(
          'transform',
          `translate(${transform.x},${transform.y})scale(${transform.k})`
        );
      this.scatter.selectAll('.points').attr('transform', d => {
        return `translate(
            ${transform.x + this.x(d[0]) * transform.k},
            ${transform.y + this.y(d[1]) * transform.k})`;
      });
    };

    // Zoom/Drag handler
    const zoom_function = d3
      .zoom()
      .scaleExtent([-100, 100])
      .on('zoom', () => {
        this.update(d3.event.transform);
      });

    container.call(zoom_function);
  }

  draw = data => {
    this.scatter
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', d3.symbol().type(d3.symbolCross))
      .attr('class', 'points')
      .attr('fill', 'blue')
      .attr('transform', d => `translate(${this.x(d[0])}, ${this.y(d[1])})`);

    if (this.transform) {
      this.update(this.transform);
    }
  };
}
