import * as d3 from 'd3'

const traverse = (root, func, i = 0) => {
  func(root, i)
  if (root.children) {
    for (let i = 0; i < root.children.length; i++) {
      traverse(root.children[i], func, i)
    }
  }
}
const downloadText = configStep => {
  const download = configStep.download ? 'Download' : 'identity(x) = x'
  const content = configStep.parse ? 'HTML' : 'file'
  return download
}
const parseText = configStep => {
  if (configStep.parse) {
    const content = configStep.parse.expect.toUpperCase()
    return `Parse ${content}`
  } else {
    return 'identity(x) = x'
  }
}

// export default ({
// rectNode,
// get,
// initialWidth,
// initialHeight,
// baseSvg,
// margin,
// nodeGroup,
// linkGroup,
// diagonal
// }) => config => {
// let width = initialWidth,
// height = initialHeight;
// const arrowSize = 12;
// const downloadToParse = 20;

// const root = d3.hierarchy(config.scrape, step => [
// ...(step.scrapeEach || []),
// ...(step.scrapeNext ? [step.scrapeNext] : [])
// ]);
// const treemap = d3.tree().size([initialHeight, initialWidth])
// treemap(root);
// traverse(root, (d, i) => {
// d.y = d.depth * (rectNode[get.height] * 1.5);
// // d.x = d.x + d.depth * 17 // make arrow start at next parse
// if (d.y + rectNode.width > width) width = d.y + rectNode.width;
// if (d.x + rectNode.height > height) height = d.x;
// });
// const descendants = root.descendants().sort((a, b) => b.y - a.y); // sort for use w/ scrapeNext
// const links = root.links().map(d => ({
// ...d,
// source: {
// ...d.source,
// y: d.source.y + rectNode.width, // make the line start after the rectangle
// x: d.source.x + downloadToParse
// },
// target: {
// ...d.target,
// y: d.target.y - arrowSize, // space for arrow
// x: d.target.x
// }
// }));
// const incrementers = descendants.filter(
// d => d.data.download && d.data.download.increment
// );

// baseSvg
// .attr("width", width + margin.right + margin.left)
// .attr("height", height + margin.top + margin.bottom);

// // Nodes
// const gNodeAll = nodeGroup.selectAll("g").data(descendants);

// const gNode = gNodeAll
// .enter()
// .append("g")
// .merge(gNodeAll)
// .attr(
// "transform",
// d => `translate(${d[get.x]}, ${d[get.y] - rectNode.height / 2})`
// );
// gNodeAll.exit().remove();

// // Labels
// const labelDiv = gNode
// .merge(gNodeAll)
// .append("foreignObject")
// .classed("label", true)
// .attr("width", rectNode.width)
// .attr("height", rectNode.height)
// .append("xhtml:div")
// .classed("scrape-step", true)
// .attr("title", d => d.data.name);
// labelDiv
// .append("div")
// .classed("name", true)
// .text(d => d.data.name);
// labelDiv
// .append("div")
// .classed("download", true)
// .classed("identity", d => !d.data.download)
// .text(d => downloadText(d.data));
// labelDiv
// .append("div")
// .classed("parse", true)
// .classed("identity", d => !d.data.parse)
// .text(d => parseText(d.data));

// // Increment Links
// const curveHeight = 30;
// const curvePull = downloadToParse;
// gNode
// .filter(d => d.data.download && d.data.download.increment)
// .append("g")
// .classed("link", true)
// .append("path")
// .attr(
// "d",
// d =>
// `M ${rectNode.width} ${rectNode.height / 2 + downloadToParse}
// C ${rectNode.width + curvePull} ${rectNode.height / 2 +
// downloadToParse} ${rectNode.width +
// curvePull * 2} ${-curveHeight} ${rectNode.width / 2} ${-curveHeight}
// C ${-curvePull - arrowSize - 10} ${-curveHeight} ${-curvePull -
// arrowSize} ${rectNode.height / 2} ${-arrowSize} ${rectNode.height /
// 2}`
// );
// // scrapeNext Links
// // sort descendants by y
// // for scrapeNext, find max x of y's that are greater than it

// // Links
// const linksAll = linkGroup.selectAll("path").data(links);
// linksAll
// .enter()
// .append("g")
// .merge(linksAll)
// .classed("link", true)
// .append("path")
// .attr("d", diagonal)
// .attr("marker-end", "url(#end-arrow)");
// linksAll.exit().remove();
// };
export default ({
  rectNode,
  get,
  baseSvg,
  svgGroup,
  margin,
  nodeGroup,
  linkGroup,
  diagonal
}) => config => {
  const arrowSize = 12
  const downloadToParse = 20

  const root = d3.hierarchy(config.scrape, step => [
    ...(step.scrapeEach || []),
    ...(step.scrapeNext ? [step.scrapeNext] : [])
  ])
  const treemap = d3
    .tree()
    .nodeSize([
      rectNode.height + rectNode.margin,
      rectNode.width + rectNode.margin
    ])
  treemap(root)
  const descendants = root.descendants().sort((a, b) => b.y - a.y) // sort for use w/ scrapeNext
  const links = root.links().map(d => ({
    ...d,
    source: {
      ...d.source,
      y: d.source.y + rectNode.width, // make the line start after the rectangle
      x: d.source.x + downloadToParse // make arrow start at parse
    },
    target: {
      ...d.target,
      y: d.target.y - arrowSize, // space for arrow
      x: d.target.x
    }
  }))
  nodeGroup.selectAll('*').remove()
  linkGroup.selectAll('*').remove()

  // Nodes
  const gNodeAll = nodeGroup.selectAll('g').data(descendants)

  const gNode = gNodeAll
    .enter()
    .append('g')
    // .merge(gNodeAll)
    .attr(
      'transform',
      d => `translate(${d[get.x]}, ${d[get.y] - rectNode.height / 2})`
    )

  // Labels
  const labelDiv = gNode
    .merge(gNodeAll)
    .append('foreignObject')
    .classed('label', true)
    .attr('width', rectNode.width)
    .attr('height', rectNode.height)
    .append('xhtml:div')
    .classed('scrape-step', true)
    .attr('title', d =>
      JSON.stringify(
        d.data,
        (k, v) => {
          if (k === 'scrapeEach' && v.length) return '' + v
          else if (k === 'scrapeNext' && v) return '' + v
          else return v
        },
        2
      )
    )
  labelDiv
    .append('div')
    .classed('name', true)
    .text(d => d.data.name)
  labelDiv
    .append('div')
    .classed('download', true)
    .classed('identity', d => !d.data.download)
    .text(d => downloadText(d.data))
  labelDiv
    .append('div')
    .classed('parse', true)
    .classed('identity', d => !d.data.parse)
    .text(d => parseText(d.data))

  // Increment Links
  const curveHeight = 30
  const curvePull = downloadToParse
  gNode
    .filter(d => d.data.download && d.data.download.increment)
    .append('g')
    .classed('link', true)
    .append('path')
    .attr(
      'd',
      d =>
        `M ${rectNode.width} ${rectNode.height / 2 + downloadToParse}
      C ${rectNode.width + curvePull} ${rectNode.height / 2 +
          downloadToParse} ${rectNode.width +
          curvePull * 2} ${-curveHeight} ${rectNode.width / 2} ${-curveHeight}
      C ${-curvePull - arrowSize - 10} ${-curveHeight} ${-curvePull -
          arrowSize} ${rectNode.height / 2} ${-arrowSize} ${rectNode.height /
          2}`
    )
  // scrapeNext Links
  // sort descendants by y
  // for scrapeNext, find max x of y's that are greater than it

  // Links
  const linksAll = linkGroup.selectAll('path').data(links)
  linksAll
    .enter()
    .append('g')
    .merge(linksAll)
    .classed('link', true)
    .append('path')
    .attr('d', diagonal)
    .attr('marker-end', 'url(#end-arrow)')

  // recenter tree
  const treeBBox = svgGroup.node().getBBox()
  baseSvg
    .attr('width', treeBBox.width + margin.right + margin.left)
    .attr('height', treeBBox.height + margin.top + margin.bottom)
  svgGroup.attr(
    'transform',
    `translate(${margin.left}, ${treeBBox.height / 2 + margin.top})`
  )
}
