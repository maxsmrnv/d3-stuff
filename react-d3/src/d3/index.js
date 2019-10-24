import * as d3 from 'd3'

export class D3Container {
  constructor() {
    this.scatter = null
    this.x = null
    this.y = null
    this.z = null
    this.transform = null
    this.update = null
    this.container = null
    this.zoom_function = null
  }
  init(selector) {
    // d3.select('svg > *').remove();
    const margin = { top: 100, right: 100, bottom: 100, left: 100 }
    const outerWidth = 800
    const outerHeight = 800
    const width = outerWidth - margin.left - margin.right
    const height = outerHeight - margin.top - margin.bottom

    this.container = d3.select(selector)

    // Init SVG
    const svgChart = this.container
      .append('svg:svg')
      .attr('width', outerWidth)
      .attr('height', outerHeight)
      .attr('class', 'svg-plot')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    // Add a clipPath: everything out of this area won't be drawn.

    svgChart
      .append('defs')
      .append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0)

    // Create the this.scatter variable: where both the circles and the brush take place
    this.scatter = svgChart.append('g').attr('clip-path', 'url(#clip)')

    // Init Scales
    this.x = d3
      .scaleLinear()
      .domain([-1100, 1100])
      .range([0, width])
      .nice()

    this.y = d3
      .scaleLinear()
      .domain([-1100, 1100])
      .range([height, 0])
      .nice()

    this.z = d3
      .scaleLinear()
      .domain([0, 2400])
      .range([0, width])
      .nice()

    // Init Axis
    const xAxis = d3.axisTop(this.x).tickSize(2)
    const yAxis = d3.axisLeft(this.y).tickSize(2)

    // Add Axis
    const gxAxis = svgChart.append('g').call(xAxis)
    const gyAxis = svgChart.append('g').call(yAxis)

    // Update plot on canvas
    this.update = transform => {
      this.transform = transform
      const scaleX = transform.rescaleX(this.x)
      const scaleY = transform.rescaleY(this.y)

      gxAxis.call(xAxis.scale(scaleX))
      gyAxis.call(yAxis.scale(scaleY))

      this.scatter.selectAll('.contour').attr('transform', transform)

      this.scatter.selectAll('.polyLayer').attr('transform', transform)

      this.scatter.selectAll('.line').attr('transform', transform)

      this.scatter.selectAll('.symbol').attr('transform', d => {
        //   const curTransform = d3.select(this).attr('transform')

        //   function getTranslation(transform) {
        //     // Create a dummy g for calculation purposes only. This will never
        //     // be appended to the DOM and will be discarded once this function
        //     // returns.
        //     var g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

        //     // Set the transform attribute to the provided string value.
        //     g.setAttributeNS(null, 'transform', transform)

        //     // consolidate the SVGTransformList containing all transformations
        //     // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
        //     // its SVGMatrix.
        //     var matrix = g.transform.baseVal.consolidate().matrix

        //     // As per definition values e and f are the ones for the translation.
        //     return [matrix.e, matrix.f]
        //   }

        return `translate(
            ${transform.x + this.x(d[0]) * transform.k},
            ${transform.y + this.y(d[1]) * transform.k})`
      })
    }

    // Zoom/Drag handler
    this.zoom_function = d3
      .zoom()
      .scaleExtent([-100, 100])
      .on('zoom', () => {
        this.update(d3.event.transform)
      })

    this.container.call(this.zoom_function)
  }

  resetZoomPan = () => {
    this.container
      .transition()
      .duration(500)
      .call(this.zoom_function.transform, d3.zoomIdentity)
  }

  drawLine = ({ data }) => {
    const line = d3
      .line()
      .x(d => this.x(d[0]))
      .y(d => this.y(d[1]))
    this.scatter
      .append('g')
      .attr('class', 'lines')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', d => line(d))
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', 'brown')
      .style('stroke-width', 1)
  }

  drawContour = data => {
    this.scatter.selectAll('.contourContainer').remove()

    const baseContour = this.scatter
      .append('g')
      .attr('class', 'contourContainer')

    const drawCircle = ({ x, y, r }) => {
      baseContour
        .append('circle')
        .attr('class', 'contour')
        .attr('cx', this.x(x))
        .attr('cy', this.y(y))
        .attr('r', this.z(r))
        .style('fill', 'none')
        .style('stroke', 'navy')
        .style('stroke-width', 1)
    }

    const drawRect = ({ x, y, w, h }) => {
      baseContour
        .append('rect')
        .attr('class', 'contour')
        .attr('x', this.x(x))
        .attr('y', this.y(y))
        .attr('width', this.z(w))
        .attr('height', this.z(h))
        .style('fill', 'none')
        .style('stroke', 'navy')
        .style('stroke-width', 1)
    }

    const drawPolyContour = ({ points }) => {
      baseContour
        .selectAll('polygon')
        .data(points)
        .enter()
        .append('polygon')
        .attr('class', 'contour')
        .attr('points', d =>
          d.map(d => [this.x(d[0]), this.y(d[1])].join(',')).join(' ')
        )
        .style('fill', 'none')
        .style('stroke', 'navy')
        .style('stroke-width', 1)
    }

    switch (data.type) {
      case 'rectContour':
        drawRect(data)
        break
      case 'circleContour':
        drawCircle(data)
        break
      case 'polyContour':
        drawPolyContour(data)
        break
      default:
        console.log('undefined contour type')
    }

    if (this.transform) {
      this.update(this.transform)
    }
  }

  drawPolyLayers = data => {
    this.scatter
      .append('g')
      .attr('class', 'layers')
      .selectAll('polygon')
      .data(data)
      .enter()
      .append('polygon')
      .attr('class', 'polyLayer')
      .attr('points', d =>
        d.map(d => [this.x(d[0]), this.y(d[1])].join(',')).join(' ')
      )
      .style('fill', 'green')
      .style('opacity', 0.2)
  }

  drawSymbols = data => {
    // this.scatter.selectAll('.symbols').remove();
    const rules = {
      symbolTriangle: {
        render: d3.symbolTriangle,
        color: 'blue',
      },
      symbolCircle: {
        render: d3.symbolCircle,
        color: 'red',
      },
    }

    function dragstarted() {
      d3.select(this)
        .raise()
        .attr('stroke', 'black')
        .attr('cursor', 'grabbing')
    }

    function dragended() {
      d3.select(this)
        .attr('stroke', null)
        .attr('cursor', 'grab')
    }

    const dragged = context => {
      d3.event.sourceEvent.stopPropagation() // silence other listeners
      const x = d3.event.x
      const y = d3.event.y
      d3.select(context).attr('transform', `translate(${x},${y})`)
    }

    var dragBehavior = d3
      .drag()
      .on('start', dragstarted)
      .on('drag', function() {
        return dragged(this)
      })
      .on('end', dragended)

    data.forEach(d => {
      this.scatter
        .append('g')
        .attr('class', 'symbols')
        .selectAll('path')
        .data(d.data)
        .enter()
        .append('path')
        .attr('d', d3.symbol().type(rules[d.type].render))
        .attr('class', 'symbol')
        .attr('fill', rules[d.type].color)
        .attr('transform', d => {
          return `translate(${this.x(d[0])}, ${this.y(d[1])})`
        })
        .attr('cursor', 'grab')
        .call(dragBehavior)
    })

    // if (this.transform) {
    //   this.update(this.transform);
    // }
  }
}
