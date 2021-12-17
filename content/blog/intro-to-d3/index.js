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

  // Background
  outlineSVG
    .append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "#fff")
    .style("stroke", "#000")

  fs.writeFileSync(__dirname + "/example_bg.svg", outlineBody.html())

  // Y line
  outlineSVG
    .append("line")
    .attr("x1", margin.left)
    .attr("y1", margin.top)
    .attr("x2", margin.left)
    .attr("y2", margin.top + plotHeight)
    .style("stroke", "#000")

  fs.writeFileSync(__dirname + "/example_y.svg", outlineBody.html())

  // X line
  outlineSVG
    .append("line")
    .attr("x1", margin.left)
    .attr("y1", margin.top + plotHeight)
    .attr("x2", margin.left + plotWidth)
    .attr("y2", margin.top + plotHeight)
    .style("stroke", "#000")

  fs.writeFileSync(__dirname + "/example_x.svg", outlineBody.html())

  // Y Label
  outlineSVG
    .append("text")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .text("Y-Axis Label")

  fs.writeFileSync(__dirname + "/example_lab_y.svg", outlineBody.html())

  // X Label
  outlineSVG
    .append("text")
    .attr("x", margin.left + plotWidth)
    .attr("y", margin.top + plotHeight)
    .text("X-Axis Label")

  fs.writeFileSync(__dirname + "/example_lab_x.svg", outlineBody.html())

  // Title
  outlineSVG
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", (margin.top / 3) * 2) // two-thirds
    .text("Chart Title")

  fs.writeFileSync(__dirname + "/example_title.svg", outlineBody.html())
})
