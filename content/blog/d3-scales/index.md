---
title: D3 Scales
date: 2021-12-27
description: Simplified axis generation and positioning with scales
---

<div class="call-out-indigo">

This post is part of a series on data wrangling and visualisation with JavaScript.
You can find the other posts in the series at the links below.

- [Intro — Data Wrangling and Visualisation with JavaScript](../data-wrangling-with-js)
- [Pt. I — Unnesting Arrays](../unnesting-arrays)
- [Pt. II — Reducing Arrays](../reducing-arrays)
- [Pt. III — Intro to D3](../intro-to-d3)
- [Pt. IV — Binding data with D3](../binding-data-d3)
- [Pt. V — D3 Scales](../d3-scales)
- [Pt. VI — Horizontal Bar Plot With D3](../horizontal-bar-plot)

</div>

```js
let bars = outlineSVG.append("g").selectAll("rect").data(ibu).join("rect")
```

![Just bars](./just_bars.svg)

```js
const scaleX = d3
  .scaleLinear()
  .domain([0, ibu.at(0).value])
  .range([0, plotWidth])
```

```js
const scaleY = d3
  .scaleBand()
  .range([0, plotHeight])
  .domain(ibu.map(x => x.name))
  .padding(0.1) // Adds space between the bars
```

```js
bars.attr("height", scaleY.bandwidth())
bars.attr("width", data => scaleX(data.value))
```

![Bar Height & Width](./height_width.svg)

```js
bars.attr("x", 0.5) // Half pixel?
bars.attr("y", data => scaleY(data.name))
```

![X Y Position](./x_y.svg)

```js
bars.attr("transform", `translate(${margin.left}, ${margin.top})`)
```

![Transform](./translate.svg)

```js
bars.attr("fill", "#00AFDB")
```

![Fill](./fill.svg)

```js
bars.style("stroke", "#000")
```

![Stroke](./stroke.svg)