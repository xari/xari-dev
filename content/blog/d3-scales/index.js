const fs = require("fs")
const path = require("path")
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const beers = JSON.parse(fs.readFileSync("./beers.json"))

const ibu = beers
  .map(beer => ({
    name: beer.name,
    value: beer.ibu,
  }))
  .filter(x => Number(x.value))
  .sort((a, b) => b.value - a.value)
  .slice(0, 20)

// Load D3 and create a canvas + context
let d3 = import("d3").then(d3 => {
  const __dirname = path.resolve(path.dirname(""))

  const width = 680
  const height = 480
  const margin = { top: 80, right: 50, bottom: 60, left: 200 }
  const plotHeight = height - margin.top - margin.bottom
  const plotWidth = width - margin.left - margin.right

  // Outline
  const outlineBody = d3.select(new JSDOM().window.document).select("body")

  const outlineSVG = outlineBody
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", width)
    .attr("height", height)

  outlineSVG
    .append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "#fff")
    .style("stroke", "#000")

  let bars = outlineSVG.append("g").selectAll("rect").data(ibu).join("rect")

  fs.writeFileSync(__dirname + "/just_bars.svg", outlineBody.html())

  const scaleX = d3
    .scaleLinear()
    .domain([0, ibu.at(0).value])
    .range([0, plotWidth])

  const scaleY = d3
    .scaleBand()
    .range([0, plotHeight])
    .domain(ibu.map(x => x.name))
    .padding(0.1) // Adds space between the bars

  bars.attr("height", scaleY.bandwidth())
  bars.attr("width", data => scaleX(data.value))

  fs.writeFileSync(__dirname + "/height_width.svg", outlineBody.html())

  bars.attr("x", 0.5) // Half pixel?
  bars.attr("y", data => scaleY(data.name))

  fs.writeFileSync(__dirname + "/x_y.svg", outlineBody.html())

  bars.attr("transform", `translate(${margin.left}, ${margin.top})`)

  fs.writeFileSync(__dirname + "/translate.svg", outlineBody.html())

  bars.attr("fill", "#00AFDB")

  fs.writeFileSync(__dirname + "/fill.svg", outlineBody.html())

  bars.style("stroke", "#000")

  fs.writeFileSync(__dirname + "/stroke.svg", outlineBody.html())
})
