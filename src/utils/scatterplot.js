import * as d3 from "d3";

function getBeers(page = 1, beers = []) {
  return fetch(`https://api.punkapi.com/v2/beers?per_page=80&page=${page}`).
      then(response => response.json()).
      then(newBeers => {
          const allBeers = [...beers, ...newBeers];

	  if (newBeers.length !== 0) { // highlight-start
	      page++;

	      return getBeers(page, allBeers);
	  } // highlight-end

	  return allBeers;
	  });
}

function keepOnlyWantedProperties(beers) {
    return beers.map(beer => ({
         name: beer.name,
	 tagline: beer.tagline,
	 description: beer.description,
	 first_brewed: beer.first_brewed,
	 food_pairing: beer.food_pairing,
	 abv: beer.abv, // alcohol by volume
	 ibu: beer.ibu, // bitterness
	 ph: beer.ph // acididy
    }));
}

export default function scatterplot(ref) {
	// set the dimensions and margins of the graph
	const margin = { top: 10, right: 30, bottom: 40, left: 50 },
		width = 520 - margin.left - margin.right,
		height = 520 - margin.top - margin.bottom;

	const svg = d3.select(ref.current)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	getBeers().
		then(fetchedBeers => fetchedBeers |> keepOnlyWantedProperties).
		then(beers => {
			// Set bounds
			const x_max = d3.max(beers.map(beer => beer.abv <= 30 ? beer.abv : null));
			const y_max = d3.max(beers.map(beer => beer.ibu <= 300 ? beer.ibu : null));

			// Set non-conforming PH values to null
			const fill_min = d3.min(beers.map(beer => beer.ph > 0 && beer.ph <= 14 ? beer.ph : null));
			const fill_max = d3.max(beers.map(beer => beer.ph > 0 && beer.ph <= 14 ? beer.ph : null));

			// Add X axis
			const x = d3.scaleLinear()
				.domain([0, x_max * 1.01])
				.range([0, width]);

			svg.append("g")
				.attr("transform", `translate(0, ${height})`)
				.call(d3.axisBottom(x).tickSize(- height * 1.3).ticks(10))
				.select(".domain")
				.remove();

			// Add Y axis
			const y = d3.scaleLinear()
				.domain([0, y_max * 1.01])
				.range([height, 0])
				.nice();

			svg.append("g")
				.call(d3.axisLeft(y).tickSize(- width * 1.3).ticks(7))
				.select(".domain")
				.remove();

			svg.selectAll(".tick line").attr("stroke", "#ebebeb");

			// X axis label:
			svg.append("text")
				.attr("text-anchor", "end")
				.attr("x", width)
				.attr("y", height + margin.top + 20)
				.text("ABV");

			// Y axis label:
			svg.append("text")
				.attr("text-anchor", "end")
				.attr("transform", "rotate(-90)")
				.attr("y", - margin.left + 20)
				.attr("x", - margin.top)
				.text("IBU")

			const viridus = d3.scaleSequential()
				.domain([fill_min, fill_max]) // PH scale
				.interpolator(d3.interpolateViridis);
			
			// Add dots
			svg.append("g")
				.selectAll("dot")
				.data(beers)
				.enter()
				.append("circle")
				.attr("cx", function (d) { return x(d.abv); } )
				.attr("cy", function (d) { return y(d.ibu); } )
				.attr("r", 5)
				.style("fill", function (d) { return viridus(d.ph) } )
		});
}
