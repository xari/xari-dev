const fs = require("fs")
const path = require("path")
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const beers = JSON.parse(fs.readFileSync("./beers.json"))

// Load D3 and create a canvas + context
import("d3").then(d3 => {
  const __dirname = path.resolve(path.dirname(""))

  const width = 680
  const height = 480
  const margin = { top: 80, right: 50, bottom: 60, left: 200 }
  const plotHeight = height - margin.top - margin.bottom
  const plotWidth = width - margin.left - margin.right

  const body = d3.select(new JSDOM().window.document).select("body")

  const ibu = beers
    .map(beer => ({
      name: beer.name,
      value: beer.ibu,
    }))
    .filter(x => Number(x.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)

  const svg = body
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", width)
    .attr("height", height)

  // White background
  svg
    .append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "#fff")

  // Draw the outline
  const documentOutline = svg
    .append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("x", 0)
    .attr("y", 0)
    .style("stroke", "#000")
    .style("fill", "none")

  fs.writeFileSync(__dirname + "/outline.svg", body.html())

  // Draw the inner box to show where the plot will be

  // 0, 0 is top left
  const plotOutline = svg
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("height", plotHeight)
    .attr("width", plotWidth)
    .style("fill", "#00AFDB")

  fs.writeFileSync(__dirname + "/plot-outline.svg", body.html())

  // Create the scales

  const scaleX = d3
    .scaleLinear()
    .domain([0, ibu.at(0).value])
    .range([0, plotWidth])

  // X Axis
  const axisX = svg
    .append("g") // new "group"
    .attr("transform", `translate(0, ${plotHeight})`)
    .call(d3.axisBottom(scaleX))

  fs.writeFileSync(__dirname + "/x_axis.svg", body.html())

  axisX
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")

  fs.writeFileSync(__dirname + "/rotated.svg", body.html())

  axisX.attr(
    "transform",
    `translate(${margin.left}, ${plotHeight + margin.top})`
  )

  fs.writeFileSync(__dirname + "/positioned.svg", body.html())

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", (margin.top / 3) * 2) // 2 thirds of the way
    .attr("text-anchor", "middle")
    .text("Brewdog's Most Bitter Beers")
    .style("font-size", "18px")
    .style("font-weight", "bold")

  fs.writeFileSync(__dirname + "/title.svg", body.html())

  // Label X Axis
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.left + plotWidth + 25)
    .attr("y", margin.top + plotHeight + 25)
    .text("IBU")
    .style("font-size", "14px")
    .style("font-weight", "bold")

  fs.writeFileSync(__dirname + "/label.svg", body.html())

  const scaleY = d3
    .scaleBand()
    .range([0, plotHeight])
    .domain(ibu.map(x => x.name))
    .padding(0.1) // Adds space between the bars

  // Y Axis
  const yNoTicks = d3.axisLeft(scaleY).tickSize(0)

  const axisY = svg
    .append("g")
    .call(yNoTicks)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .style("font-size", "12px")
    .style("font-weight", "light")
    .style("fill", "#000")
    .style("stroke", "none")

  fs.writeFileSync(__dirname + "/y_axis.svg", body.html())

  // Remove the two existing rects
  documentOutline.remove()
  plotOutline.remove()

  fs.writeFileSync(__dirname + "/axes.svg", body.html())

  // Remove domain line from Y axis
  axisY.call(g => g.select(".domain").remove())

  fs.writeFileSync(__dirname + "/remove_domain.svg", body.html())

  // Not yet visible without width and height
  let bars = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .selectAll("rect")
    .data(ibu)
    .join("rect")

  // Now visible, but stacked on top of each other
  bars
    .attr("width", data => scaleX(data.value))
    .attr("height", scaleY.bandwidth())

  fs.writeFileSync(__dirname + "/un_positioned.svg", body.html())

  bars.remove()

  // Properly spaced along the Y axis
  bars = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .selectAll("rect")
    .data(ibu)
    .join("rect")
    .attr("width", data => scaleX(data.value))
    .attr("height", scaleY.bandwidth())
    .attr("y", data => scaleY(data.name))

  fs.writeFileSync(__dirname + "/positioned-y.svg", body.html())

  bars.remove()

  // Styled
  bars = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .selectAll("rect")
    .data(ibu)
    .join("rect")
    .attr("width", data => scaleX(data.value))
    .attr("height", scaleY.bandwidth())
    .attr("y", data => scaleY(data.name))
    .attr("fill", "#00AFDB")
    .style("stroke", "#000")

  fs.writeFileSync(__dirname + "/styled.svg", body.html())

  bars.remove()

  // Store transform / scale for reset later
  const transform = d3.zoomTransform(svg.node())

  // Zoom-in to axis origin
  svg.attr("transform", `translate(${1800}, ${-2750})scale(15)`)

  // Zoomed-in:
  bars = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .selectAll("rect")
    .data(ibu)
    .join("rect")
    .attr("width", data => scaleX(data.value))
    .attr("height", scaleY.bandwidth())
    .attr("y", data => scaleY(data.name))
    .attr("fill", "#00AFDB")
    .style("stroke", "#000")

  fs.writeFileSync(__dirname + "/zoomed.svg", body.html())

  bars.remove()

  // Corrected x origin
  bars = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .selectAll("rect")
    .data(ibu)
    .join("rect")
    .attr("width", data => scaleX(data.value))
    .attr("height", scaleY.bandwidth())
    .attr("y", data => scaleY(data.name))
    .attr("x", 0.5)
    .attr("fill", "#00AFDB")
    .style("stroke", "#000")

  fs.writeFileSync(__dirname + "/positioned-x.svg", body.html())

  // Reset transform to pre-zoom origin
  svg.attr("transform", transform)

  fs.writeFileSync(__dirname + "/bars.svg", body.html())
})
