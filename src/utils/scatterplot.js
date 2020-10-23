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
	 ibu: beer.ibu // bitterness
    }));
}

export default function scatterplot(ref) {
	// set the dimensions and margins of the graph
	const margin = {top: 10, right: 30, bottom: 30, left: 60},
		width = 460 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	const svg = d3.select(ref.current)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	getBeers().
		then(fetchedBeers => fetchedBeers |> keepOnlyWantedProperties).
		then(beers => {
			// Add X axis
			const x = d3.scaleLinear()
				.domain([0, 15])
				.range([ 0, width ]);
			svg.append("g")
				.attr("transform", `translate(0, ${height})`)
				.call(d3.axisBottom(x));

			// Add Y axis
			const y = d3.scaleLinear()
				.domain([0, 90])
				.range([ height, 0]);
			svg.append("g")
				.call(d3.axisLeft(y));

			// Add dots
			svg.append('g')
				.selectAll("dot")
				.data(beers)
				.enter()
				.append("circle")
				.attr("cx", function (d) { return x(d.abv); } )
				.attr("cy", function (d) { return y(d.ibu); } )
				.attr("r", 1.5)
				.style("fill", "#69b3a2")
		});
}
