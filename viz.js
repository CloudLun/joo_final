const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
  .select(".viz")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("body").append("div").attr("class", "tooltip");

let co = svg.append("g").attr("class", "co");
let missing = svg.append("g").attr("class", "missing");

let path;
let totalLength;

const data = ["./data/data.csv", "./data/dataNum.csv"];

const promises = [d3.csv(data[0]), d3.csv(data[1])];
const upsideDown = "translate(1440, 745) rotate(180)";

Promise.all(promises).then((data) => {
  data[0].map((d) => (d["co2"] = +d["co2"]));
  data[1].map((d) => (d["2019"] = +d["2019"]));
  console.log(data[1]);

  arcPathGenerator(svg, 280, 280);
  circlesGenerator(
    co,
    "c02",
    data[0],
    "co2",
    "red",
    "translate(0, -35)",
    "country"
  );
  arcPathGenerator(svg, 280, 280);
  circlesGenerator(
    missing,
    "missing",
    data[1],
    "2019",
    "orange",
    upsideDown,
    "GeoAreaName"
  );
});

function arcGenerator(i, o) {
  return d3
    .arc()
    .innerRadius(i)
    .outerRadius(o)
    .startAngle(Math.PI / 2)
    .endAngle(-Math.PI / 2);
}

function arcPathGenerator(svg, i, o) {
  path = svg.append("path").attr("d", arcGenerator(i, o));
  totalLength = path.node().getTotalLength();
}

function circlesGenerator(
  elements,
  name,
  data,
  variable,
  color,
  transform,
  countries
) {
  const rScale = d3
    .scaleLinear()
    .domain(d3.extent(data.map((d) => d[variable])))
    .range([5, 60]);

  //   let rotateTranslate = d3.svg.transform().rotate(180).translate(200,0);

  elements
    .append("g")
    .attr("class", `${name}Circles`)
    .selectAll(`${name}Circles`)
    .exit()
    .remove()
    .data(data)
    .enter()
    .append("circle")
    .attr("class", `${name}Circle`)
    .attr("data-index", (d, i) => `${i}`)
    .attr("data-content", (d) => d.node)
    .attr(
      "cx",
      (d, i) =>
        path
          .node()
          .getPointAtLength(((totalLength / (data.length - 1)) * i) / 2).x +
        width / 2
    )
    .attr(
      "cy",
      (d, i) =>
        path
          .node()
          .getPointAtLength(((totalLength / (data.length - 1)) * i) / 2).y +
        height / 2
    )
    .attr("r", (d) => rScale(d[variable]))
    .attr("fill", color)
    .attr("visibility", "visible")
    .attr("opacity", 0.7)
    .attr("transform", transform)
    .on("mouseover", (e, d) => {
      content = `${d[countries]}: ${d[variable]}`;
      tooltip.html(content).style("visibility", "visible");
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("top", e.pageY - (tooltip.node().clientHeight + 5) + "px")
        .style("left", e.pageX - tooltip.node().clientWidth / 2.0 + "px");
    })
    .on("mouseout", (e, d) => {
      tooltip.style("visibility", "hidden");
    });
}
