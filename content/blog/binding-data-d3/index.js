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

  // Text
  const text = outlineSVG
    .append("g")
    .selectAll("text")
    .data(ibu)
    .enter()
    .append("text")
    .text(beer => beer.name)

  fs.writeFileSync(__dirname + "/text.svg", outlineBody.html())

  text.attr("x", margin.left)

  fs.writeFileSync(__dirname + "/x.svg", outlineBody.html())

  text.attr("y", (x, i) => margin.top + i * (plotHeight / ibu.length))

  fs.writeFileSync(__dirname + "/y.svg", outlineBody.html())

  text.attr("text-anchor", "end")

  fs.writeFileSync(__dirname + "/text-anchor.svg", outlineBody.html())

  text.style("font-family", "sans-serif")

  fs.writeFileSync(__dirname + "/font-family.svg", outlineBody.html())

  text.style("font-size", "12px")

  fs.writeFileSync(__dirname + "/font-size.svg", outlineBody.html())
})
