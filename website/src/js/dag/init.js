import * as d3 from 'd3';
import updateFunc from './update';

export default () => {
  // for quick switching diagonal
  const get = {
    x: 'y',
    y: 'x',
    width: 'height',
    height: 'width',
  };

  const margin = {top: 20, right: 20, bottom: 20, left: 20};
  // dynamically set these later
  let width = 200,
    height = 400;
  // elements
  const rectNode = {width: 140, height: 75, textMargin: 5, margin: 68};
  const baseSvg = d3
    .select('#tree-container')
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom);
  const svgGroup = baseSvg
    .append('g')
    .attr('class', 'drawarea')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  const defsGroup = baseSvg.append('svg:defs');
  const defs = {
    arrow: defsGroup
      .append('marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .attr('class', 'arrow')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5'),
  };

  const nodeGroup = svgGroup.append('g').attr('id', 'nodes');
  const linkGroup = svgGroup.append('g').attr('id', 'links');
  const diagonal = d3
    .linkHorizontal()
    .x(d => d[get.x])
    .y(d => d[get.y]);

  // update function, call it on text box change
  const updater = updateFunc({
    get,
    rectNode,
    margin,
    baseSvg,
    svgGroup,
    nodeGroup,
    linkGroup,
    diagonal,
  });
  return updater;
};
