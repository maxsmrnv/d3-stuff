import * as d3 from 'd3';

export class D3Container {
  constructor() {
    this.scatter = null;
    this.x = null;
    this.y = null;
    this.transform = null;
    this.update = null;
    this.container = null;
    this.zoom_function = null;
  }
  init(selector) {
    // d3.select('svg > *').remove();
    const margin = { top: 100, right: 100, bottom: 100, left: 100 };
    const outerWidth = 800;
    const outerHeight = 800;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    this.container = d3.select(selector);

    // Init SVG
    const svgChart = this.container
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


    // Update plot on canvas
    this.update = transform => {
      this.transform = transform;
      const scaleX = transform.rescaleX(this.x);
      const scaleY = transform.rescaleY(this.y);

      gxAxis.call(xAxis.scale(scaleX));
      gyAxis.call(yAxis.scale(scaleY));

  
      this.scatter
        .selectAll('circle')
        .attr('transform', transform);

        this.scatter
        .selectAll('polygon')
        .attr('transform', transform);

        this.scatter
        .selectAll('rect')
        .attr('transform', transform);


      this.scatter.selectAll('.points').attr('transform', d => {
        return `translate(
            ${transform.x + this.x(d[0]) * transform.k},
            ${transform.y + this.y(d[1]) * transform.k})`;
      });

      this.scatter.selectAll('.line').attr('transform', transform);

    };

    // Zoom/Drag handler
    this.zoom_function = d3
      .zoom()
      .scaleExtent([-100, 100])
      .on('zoom', () => {
        this.update(d3.event.transform);
      });

    this.container.call(this.zoom_function);

  }


  reset = () => {
    this.container.transition().duration(500).call(this.zoom_function.transform, d3.zoomIdentity)
  }

  drawLine = data => {
    const line = d3.line().x(d => this.x(d[0])).y(d => this.y(d[1]))
    this.scatter
    .append('g')
    .attr('class', 'lines')
    .selectAll('path')
    .data(data.data)
    .enter()
    .append('path')
    .attr('d', d => line(d))
    .attr('class', 'line')
    .style("fill", "none")
    .style("stroke", "brown")
    .style("stroke-width", 2);
  }

  drawContour = (data)=> {
    this.scatter.selectAll('.contour').remove();
    const drawCircle = ({x,y,r}) => {
      this.scatter
      .append('g')
      .attr('class', 'contour')
      .append('circle')
      .attr('cx', this.x(x))
      .attr('cy', this.y(y))
      .attr('r', r)
      .attr('class', 'circle')
      .style("fill", "none")
      .style("stroke", "navy")
      .style("stroke-width", 1);
    }

    const drawRect = ({x,y,w,h}) => {
      this.scatter
      .append('g')
      .attr('class', 'contour')
      .append('rect')
      .attr('x', this.x(x))
      .attr('y', this.y(y))
      .attr('width', this.y(w))
      .attr('height', this.y(h))
      .attr('class', 'rect')
      .style("fill", "none")
      .style("stroke", "navy")
      .style("stroke-width", 1);
    }

    const drawPolyContour = ({points}) => {
      this.scatter
      .append('g')
      .attr('class', 'contour')
      .selectAll("polygon")
      .data(points)
      .enter()
      .append('polygon')
      .attr("points",d => d.map(d => [this.x(d[0]),this.y(d[1])].join(",")).join(" "))
      .style("fill", "none")
      .style("stroke", "navy")
      .style("stroke-width", 1);
    }

    switch(data.type){
      case 'rectContour': 
        drawRect(data)
        break;
      case 'circleContour': 
        drawCircle(data)
        break;
      case 'polyContour': 
      drawPolyContour(data)
        break;
      default:
        console.log('undefined contour type');
    }

    if (this.transform) {
      this.update(this.transform);
    }

  }

  drawPolyLayers = data => {
    this.scatter
    .append('g')
    .attr('class', 'layers')
    .selectAll("polygon")
    .data(data)
    .enter()
    .append('polygon')
    .attr("points",d => d.map(d => [this.x(d[0]),this.y(d[1])].join(",")).join(" "))
    .style("fill", "green")
    .style("opacity", 0.2)
  }

  drawSymbols = data => {
    // this.scatter.selectAll('.symbols').remove();
    const rules = {
      symbolTriangle: {
        render: d3.symbolTriangle,
        color: 'blue'
      },
      symbolCircle: {
        render: d3.symbolCircle,
        color:'red'
      },
    }

    data.forEach(d => {
      this.scatter
      .append('g')
      .attr('class', 'symbols')
      .selectAll('path')
      .data(d.data)
        .enter()
        .append('path')
        .attr('d', d3.symbol().type(rules[d.type].render))
        .attr('class', 'points')
        .attr('fill', rules[d.type].color)
        .attr('transform', d => `translate(${this.x(d[0])}, ${this.y(d[1])})`);
    });

    if (this.transform) {
      this.update(this.transform);
    }
  };

}
