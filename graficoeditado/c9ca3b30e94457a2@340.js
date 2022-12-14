// https://observablehq.com/@daocampol/grafico-multilinea-sgr-por-entidad@340
function _1(md) {
  return (
    md``
  )
}

function _chart(d3, width, height, xAxis, yAxis, data, line, hover) {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible");

  svg.append("g")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "rgb(999,111,111)")
    .attr("stroke-width", 2)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", d => line(d.values));

  svg.call(hover, path);

  return svg.node();
}


async function _data(d3, FileAttachment) {
  const data = d3.tsvParse(await FileAttachment("BDD Valor Serie Fecha Entidad.tsv").text());
  const columns = data.columns.slice(1);
  return {
    y: "",
    series: data.map(d => ({
      name: d.name,
      values: columns.map(k => +d[k] * 1)
      // AQUI MUDA A COLUNA DO GRAFICO
    })),
    dates: columns.map(d3.utcParse("%Y-%m-%d"))
  };
}


function _hover(d3, x, y, data) {
  return (
    function hover(svg, path) {

      if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left)
      else svg
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left);

      const dot = svg.append("g")
        .attr("display", "none");

      dot.append("circle")
        .attr("r", 2.5);

      dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);

      function moved(event) {
        event.preventDefault();
        const pointer = d3.pointer(event, this);
        const xm = x.invert(pointer[0]);
        const ym = y.invert(pointer[1]);
        const i = d3.bisectCenter(data.dates, xm);
        const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
        path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
        dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
        dot.select("text").text(s.name);
      }

      function entered() {
        path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        dot.attr("display", null);
      }

      function left() {
        path.style("mix-blend-mode", "multiply").attr("stroke", null);
        dot.attr("display", "none");
      }
    }
  )
}

function _height() {
  return (
    600
  )
}

function _margin() {
  return (
    { top: 20, right: 20, bottom: 30, left: 30 }
  )
}

function _x(d3, data, margin, width) {
  return (
    d3.scaleUtc()
      .domain(d3.extent(data.dates))
      .range([margin.left, width - margin.right])
  )
}

function _y(d3, data, height, margin) {
  return (
    d3.scaleLinear()
      .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
      .range([height - margin.bottom, margin.top])
  )
}

function _xAxis(height, margin, d3, x, width) {
  return (
    g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
  )
}

function _yAxis(margin, d3, y, data) {
  return (
    g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))
  )
}

function _line(d3, x, data, y) {
  return (
    d3.line()
      .defined(d => !isNaN(d))
      .x((d, i) => x(data.dates[i]))
      .y(d => y(d))
  )
}

function _d3(require) {
  return (
    require("d3@^6.1")
  )
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["BDD Valor Serie Fecha Entidad.tsv", { url: new URL("./files/2318147be9d4e9c847e3b2f8a2bef5a2d1d4da069dfe0df7ea86462d82c3acb611e555b76819b256e9379806702473af6ce4542a5c72f90f59c4ade7814fd598.tsv", import.meta.url), mimeType: "text/tab-separated-values", toString }]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3", "width", "height", "xAxis", "yAxis", "data", "line", "hover"], _chart);
  main.variable(observer("data")).define("data", ["d3", "FileAttachment"], _data);
  main.variable(observer("hover")).define("hover", ["d3", "x", "y", "data"], _hover);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("x")).define("x", ["d3", "data", "margin", "width"], _x);
  main.variable(observer("y")).define("y", ["d3", "data", "height", "margin"], _y);
  main.variable(observer("xAxis")).define("xAxis", ["height", "margin", "d3", "x", "width"], _xAxis);
  main.variable(observer("yAxis")).define("yAxis", ["margin", "d3", "y", "data"], _yAxis);
  main.variable(observer("line")).define("line", ["d3", "x", "data", "y"], _line);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
