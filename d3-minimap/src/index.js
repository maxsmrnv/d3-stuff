import './style.css';
import * as d3 from 'd3';
let demo = {};

demo.canvas = function() {
  'use strict';

  let width = 500,
    height = 500,
    base = null,
    wrapperBorder = 0,
    minimap = null,
    minimapPadding = 0,
    minimapScale = 0.2;

  function canvas(selection) {
    base = selection;

    let svgWidth =
      width + wrapperBorder * 2 + minimapPadding * 2 + width * minimapScale;
    let svgHeight = height + wrapperBorder * 2 + minimapPadding * 2;
    let svg = selection
      .append('svg')
      .attr('class', 'svg canvas')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('shape-rendering', 'auto');

    let svgDefs = svg.append('defs');
    svgDefs
      .append('clipPath')
      .attr('id', 'wrapperClipPath_qwpyza')
      .attr('class', 'wrapper clipPath')
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);
    svgDefs
      .append('clipPath')
      .attr('id', 'minimapClipPath_qwpyza')
      .attr('class', 'minimap clipPath')
      .attr('width', width)
      .attr('height', height)
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);

    let filter = svgDefs
      .append('svg:filter')
      .attr('id', 'minimapDropShadow_qwpyza')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '150%')
      .attr('height', '150%');
    filter
      .append('svg:feOffset')
      .attr('result', 'offOut')
      .attr('in', 'SourceGraphic')
      .attr('dx', '1')
      .attr('dy', '1');
    filter
      .append('svg:feColorMatrix')
      .attr('result', 'matrixOut')
      .attr('in', 'offOut')
      .attr('type', 'matrix')
      .attr('values', '0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.5 0');
    filter
      .append('svg:feGaussianBlur')
      .attr('result', 'blurOut')
      .attr('in', 'matrixOut')
      .attr('stdDeviation', '10');
    filter
      .append('svg:feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blurOut')
      .attr('mode', 'normal');

    // let minimapRadialFill = svgDefs
    //   .append('radialGradient')
    //   .attr('id', 'minimapGradient')
    //   .attr('gradientUnits', 'userSpaceOnUse')
    //   .attr('cx', '500')
    //   .attr('cy', '500')
    //   .attr('r', '400')
    //   .attr('fx', '500')
    //   .attr('fy', '500');
    // minimapRadialFill
    //   .append('stop')
    //   .attr('offset', '0%')
    //   .attr('stop-color', '#FFFFFF');
    // minimapRadialFill
    //   .append('stop')
    //   .attr('offset', '40%')
    //   .attr('stop-color', '#EEEEEE');
    // minimapRadialFill
    //   .append('stop')
    //   .attr('offset', '100%')
    //   .attr('stop-color', '#E0E0E0');

    let outerWrapper = svg
      .append('g')
      .attr('class', 'wrapper outer')
      .attr('transform', 'translate(0, ' + minimapPadding + ')');
    outerWrapper
      .append('rect')
      .attr('class', 'background')
      .attr('width', width + wrapperBorder * 2)
      .attr('height', height + wrapperBorder * 2);

    let innerWrapper = outerWrapper
      .append('g')
      .attr('class', 'wrapper inner')
      .attr('clip-path', 'url(#wrapperClipPath_qwpyza)')
      .attr(
        'transform',
        'translate(' + wrapperBorder + ',' + wrapperBorder + ')'
      );

    innerWrapper
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);

    let panCanvas = innerWrapper
      .append('g')
      .attr('class', 'panCanvas')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(0,0)');

    panCanvas
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);

    let zoom = d3.zoom().scaleExtent([1, 5]);

    // updates the zoom boundaries based on the current size and scale
    let updateCanvasZoomExtents = function() {
      let scale = innerWrapper.property('__zoom').k;
      let targetWidth = svgWidth;
      let targetHeight = svgHeight;
      let viewportWidth = width;
      let viewportHeight = height;
      zoom.translateExtent([
        [-viewportWidth / scale, -viewportHeight / scale],
        [
          viewportWidth / scale + targetWidth,
          viewportHeight / scale + targetHeight
        ]
      ]);
    };

    let zoomHandler = function() {
      panCanvas.attr('transform', d3.event.transform);
      // here we filter out the emitting of events that originated outside of the normal ZoomBehavior; this prevents an infinite loop
      // between the host and the minimap
      if (
        d3.event.sourceEvent instanceof MouseEvent ||
        d3.event.sourceEvent instanceof WheelEvent
      ) {
        minimap.update(d3.event.transform);
      }
      updateCanvasZoomExtents();
    };

    zoom.on('zoom', zoomHandler);

    innerWrapper.call(zoom).on('dblclick.zoom', null);

    // initialize the minimap, passing needed references
    minimap = demo
      .minimap()
      .host(canvas)
      .target(panCanvas)
      .minimapScale(minimapScale)
      .x(width + minimapPadding)
      .y(minimapPadding);

    svg.call(minimap);

    /** ADD SHAPE **/
    canvas.addItem = function(item) {
      panCanvas.node().appendChild(item.node());
      minimap.render();
    };

    /** RENDER **/
    canvas.render = function() {
      svgDefs
        .select('.clipPath .background')
        .attr('width', width)
        .attr('height', height);

      svg
        .attr(
          'width',
          width + wrapperBorder * 2 + minimapPadding * 2 + width * minimapScale
        )
        .attr('height', height + wrapperBorder * 2);

      outerWrapper
        .select('.background')
        .attr('width', width + wrapperBorder * 2)
        .attr('height', height + wrapperBorder * 2);

      innerWrapper
        .attr(
          'transform',
          'translate(' + wrapperBorder + ',' + wrapperBorder + ')'
        )
        .select('.background')
        .attr('width', width)
        .attr('height', height);

      panCanvas
        .attr('width', width)
        .attr('height', height)
        .select('.background')
        .attr('width', width)
        .attr('height', height);

      minimap
        .x(width + minimapPadding)
        .y(minimapPadding)
        .render();
    };

    canvas.reset = function() {
      //svg.call(zoom.event);
      //svg.transition().duration(750).call(zoom.event);
      zoom.transform(panCanvas, d3.zoomIdentity);
      svg.property('__zoom', d3.zoomIdentity);
      minimap.update(d3.zoomIdentity);
    };

    canvas.update = function(minimapZoomTransform) {
      zoom.transform(panCanvas, minimapZoomTransform);
      // update the '__zoom' property with the new transform on the rootGroup which is where the zoomBehavior stores it since it was the
      // call target during initialization
      innerWrapper.property('__zoom', minimapZoomTransform);

      updateCanvasZoomExtents();
    };

    updateCanvasZoomExtents();
  }

  //============================================================
  // Accessors
  //============================================================

  canvas.width = function(value) {
    if (!arguments.length) return width;
    width = parseInt(value, 10);
    return this;
  };

  canvas.height = function(value) {
    if (!arguments.length) return height;
    height = parseInt(value, 10);
    return this;
  };

  return canvas;
};

/** MINIMAP **/
demo.minimap = function() {
  'use strict';

  let minimapScale = 0.15,
    host = null,
    base = null,
    target = null,
    width = 0,
    height = 0,
    x = 0,
    y = 0;

  function minimap(selection) {
    base = selection;

    let zoom = d3.zoom().scaleExtent([0.1, 1]);

    // updates the zoom boundaries based on the current size and scale
    let updateMinimapZoomExtents = function() {
      let scale = container.property('__zoom').k;
      let targetWidth = parseInt(target.attr('width'));
      let targetHeight = parseInt(target.attr('height'));
      let viewportWidth = host.width();
      let viewportHeight = host.height();
      zoom.translateExtent([
        [-viewportWidth / scale, -viewportHeight / scale],
        [
          viewportWidth / scale + targetWidth,
          viewportHeight / scale + targetHeight
        ]
      ]);
    };

    let zoomHandler = function() {
      frame.attr('transform', d3.event.transform);
      // here we filter out the emitting of events that originated outside of the normal ZoomBehavior; this prevents an infinite loop
      // between the host and the minimap
      if (
        d3.event.sourceEvent instanceof MouseEvent ||
        d3.event.sourceEvent instanceof WheelEvent
      ) {
        // invert the outgoing transform and apply it to the host
        let transform = d3.event.transform;
        // ordering matters here! you have to scale() before you translate()
        let modifiedTransform = d3.zoomIdentity
          .scale(1 / transform.k)
          .translate(-transform.x, -transform.y);
        host.update(modifiedTransform);
      }

      updateMinimapZoomExtents();
    };

    zoom.on('zoom', zoomHandler);

    let container = selection.append('g').attr('class', 'minimap');

    // ---------------------------------------------------
    function dragStart() {
      console.log('zz', d3.event.sourceEvent);
    }

    // Initialized translation processes
    function dragMove() {
      console.log('zz', d3.event.sourceEvent);

      // translation();
    }

    // Nothing needs to happen at the end here yet.
    function dragEnd() {
      console.log('zz', d3.event.sourceEvent);

      // document.getElementById('minimap').style.cursor = 'default';
    }

    let dragBehavior = d3
      .drag()
      // .on('start', dragStart);
      // .on('drag', dragMove)
      .on('end', dragEnd);
    // ---------------------------------------------------

    container.call(zoom).on('dblclick.zoom', null);

    minimap.node = container.node();

    let frame = container.append('g').attr('class', 'frame');

    //TODO frame.call(dragBehavior);

    frame
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .attr('filter', 'url(#minimapDropShadow_qPWKOg)');

    minimap.update = function(hostTransform) {
      // invert the incoming zoomTransform; ordering matters here! you have to scale() before you translate()
      let modifiedTransform = d3.zoomIdentity
        .scale(1 / hostTransform.k)
        .translate(-hostTransform.x, -hostTransform.y);
      // call this.zoom.transform which will reuse the handleZoom method below
      zoom.transform(frame, modifiedTransform);
      // update the new transform onto the minimapCanvas which is where the zoomBehavior stores it since it was the call target during initialization
      container.property('__zoom', modifiedTransform);

      updateMinimapZoomExtents();
    };

    /** RENDER **/
    minimap.render = function() {
      // update the placement of the minimap
      container.attr(
        'transform',
        `translate(${width * 0.73},${height * 0.73})scale(${minimapScale})`
      );

      // update the visualization being shown by the minimap in case its appearance has changed
      let node = target.node().cloneNode(true);
      node.removeAttribute('id');
      base.selectAll('.minimap .panCanvas').remove();
      minimap.node.appendChild(node); // minimap node is the container's node
      d3.select(node);
      // keep the minimap's viewport (frame) sized to match the current visualization viewport dimensions
      frame
        .select('.background')
        .attr('width', width)
        .attr('height', height);
      frame.node().parentNode.appendChild(frame.node());
    };

    updateMinimapZoomExtents();
  }

  //============================================================
  // Accessors
  //============================================================

  minimap.width = function(value) {
    if (!arguments.length) return width;
    width = parseInt(value, 10);
    return this;
  };

  minimap.height = function(value) {
    if (!arguments.length) return height;
    height = parseInt(value, 10);
    return this;
  };

  minimap.x = function(value) {
    if (!arguments.length) return x;
    x = parseInt(value, 10);
    return this;
  };

  minimap.y = function(value) {
    if (!arguments.length) return y;
    y = parseInt(value, 10);
    return this;
  };

  minimap.host = function(value) {
    if (!arguments.length) {
      return host;
    }
    host = value;
    return this;
  };

  minimap.minimapScale = function(value) {
    if (!arguments.length) {
      return minimapScale;
    }
    minimapScale = value;
    return this;
  };

  minimap.target = function(value) {
    if (!arguments.length) {
      return target;
    }
    target = value;
    width = parseInt(target.attr('width'), 10);
    height = parseInt(target.attr('height'), 10);
    return this;
  };

  return minimap;
};

/** RUN SCRIPT **/

let canvas = demo
  .canvas()
  .width(window.innerWidth)
  .height(1000);
d3.select('#canvasqPWKOg').call(canvas);

let circle = d3
  .select('body')
  .append('svg')
  .append('circle')
  .attr('fill', 'red')
  .attr('cx', 100)
  .attr('cy', 200)
  .attr('r', 20);

let circle2 = d3
  .select('body')
  .append('svg')
  .append('circle')
  .attr('cx', 300)
  .attr('cy', 200)
  .attr('r', 20);

addItem(circle.node());
addItem(circle2.node());

function addItem(item) {
  canvas.addItem(d3.select(item));
}
