---
title: Paginated API requests in JavaScript
date: 2021-03-10
description: Using ES6 for more concise request structuring
---

A simple call to the Punk API will serve-up a sampling of beers by default.

```javascript
fetch("https://api.punkapi.com/v2/beers").
    then(response => response.json()).
```

The requst above will return an array of `25` beers from the Punk API's database.
We can see one of these beers below:

```javascript
{
    id: 100,
    name: 'Elvis Juice V2.0 - Prototype Challenge',
    tagline: 'Citrus Infused IPA.',
    first_brewed: '12/2015',
    description: 'Punchy resinous hoppy aromas blast from the glass; light floral and citrus notes riff against huge piney character. Showcasing Citra, Simcoe and Amarillo at their absolute best. A huge dose of grapefruit peel brings swirls of fresh pithy zest, accentuating the dry hops and building on the dry, biscuit malt base.',
    image_url: 'https://images.punkapi.com/v2/100.png',
    abv: 6.5,
    ibu: 60,
    target_fg: 1010,
    target_og: 1060,
    ebc: 25,
    srm: 12.5,
    ph: 4.4,
    attenuation_level: 83.3,
    volume: { value: 20, unit: 'litres' },
    boil_volume: { value: 25, unit: 'litres' },
    method: {
      mash_temp: [Array],
      fermentation: [Object],
      twist: 'Add grapefruit and orange peel into the boil and FV for extra citrus twist'
    },
    ingredients: {
      malt: [Array],
      hops: [Array],
      yeast: 'Wyeast 1056 - American Ale™'
    },
    food_pairing: [
      'Mexican ceviche',
      'Coriander and lime green thai curry',
      'Grapefruit souffle'
    ],
    brewers_tips: 'Shave of the surface of the citrus peel to unlock the highly aromatic compounds into the beer. Avoid putting any white pith into the brew as it will create an intense and unpleasant bitterness.',
    contributed_by: 'Sam Mason <samjbmason>'
  }
```

A query to the unparameterized `beers` endpoint will always return on `25` beers, but the Punk API database actually contains data about hundreds of different beers.
We can increase the numbers of items in the response by appending the `per_page` argument to the URL, and setting it's value to the maximum, `80`.

```javascript
"https://api.punkapi.com/v2/beers" // Provides an array of 25 beers

"https://api.punkapi.com/v2/beers?per_page=80" // Provides an array of max 80 beers

```

Attempting to return more than `80` will result in a `400` error, with the message, `'Must be a number greater than 0 and less than 80'`.
The way to access the rest of the beers in the database is to query the `beers` endpoint several times, using it's `page` argument incrementally.

In other words:

```javascript
"https://api.punkapi.com/v2/beers?per_page=80&page=1" // First page of 80 beers // highlight-line

"https://api.punkapi.com/v2/beers?per_page=80&page=2" // Second page

"https://api.punkapi.com/v2/beers?per_page=80&page=3" // Third page
// etc.

```

However; because this database is constantly being updated with new beers, the number of pages will evolve over time.
And not only that; the number of beers that the last page returns is just as unpredictable as the total number of pages.
So; if we want to `fetch` the entire list of beers from the API, we'll need to write a function that will loop through each page, until it finds a page with less than `80` beers, or a page that returns empty array.

<blockquote>
	Remember; we don't know how many times the loop will run, because we don't know the total number of pages.
	On top of that, `fetch` requests are _asynchronous_, meaning, in this case, that our script will continue to run while we wait for the API to deliver our beers to us.
	The reason that I'm pointing this out is that you may be wondering why we won't be using `map()`, or `for` or `while` to `fetch` to simply iterate through the paginated URLs.
	Using `map()` or `for` would require us to know the number of pages ahead of making the request.
	Both of these, along with `while`, would execute _synchronously_; holding-up the rest of our script from running. 
</blockquote>

We need to write a _recursive_ function that can query the first page, and then decide whether or not to keep going, based on the `length` of the returned array.
The function below will allow us to call `getBeers()` once, without any arguments, to return a Promise, which resolves to the array of beers.

```javascript
function getBeers(page = 1, beers = []) {
  return fetch(`https://api.punkapi.com/v2/beers?per_page=80&page=${page}`)
    .then(response => response.json())
    .then(newBeers => {
      const allBeers = [...beers, ...newBeers]

      if (newBeers.length !== 0) {
        // highlight-start
        page++

        return getBeers(page, allBeers)
      } // highlight-end

      return allBeers
    })
}
```

<blockquote>
	In case you've never seen a recursive function before, what's happening in the highlighted portion of the function above is **the function re-calling itself as long as the `length` of `newBeers` isn't `0`**. 
	Each time it calls itself, it passes the `page` number, and the previously fetched `beers` along.
</blockquote>

This is fab, isn't it?
Let's keep going then, and actually do something with all these beers!

The code below shows how we can access the fetched beers once the Promise has resolved.
If you haven't yet worked with Promises, then I recommend reading-up on them [here](https://medium.com/@kevinyckim33/what-are-promises-in-javascript-f1a5fc5b34bf).

```javascript
getBeers().then(fetchedBeers => console.log(fetchedBeers))
```

The first thing we'll do with our array of beers is to strip away the data that we're not interested in, and keep only what will be useful to us.

```javascript
getBeers().then(fetchedBeers =>
  fetchedBeers.map(beer => ({
    name: beer.name,
    tagline: beer.tagline,
    description: beer.description,
    first_brewed: beer.first_brewed,
    food_pairing: beer.food_pairing,
    abv: beer.abv, // alcohol by volume
    ibu: beer.ibu, // bitterness
  }))
)
```

In fact; let's wrap that into a function, so that we can keep our data pipeline easier to read.

```javascript
function keepOnlyWantedProperties(beers) {
  return beers.map(beer => ({
    name: beer.name,
    tagline: beer.tagline,
    description: beer.description,
    first_brewed: beer.first_brewed,
    food_pairing: beer.food_pairing,
    abv: beer.abv, // alcohol by volume
    ibu: beer.ibu, // bitterness
  }))
}

getBeers().then(fetchedBeers => keepOnlyWantedProperties(fetchedBeers))
```

Or; if you're running Node.js, you can use the pipe syntax!

<blockquote>
The pipe syntax in JavaScript, `|>`, is very similar to `%>%` in the R language.
It is currently only a proposal to JS, but you can start using it if you follow the steps [here](https://www.geeksforgeeks.org/javascript-pipeline-operator/). 
</blockquote>

```javascript
getBeers().then(fetchedBeers => fetchedBeers |> keepOnlyWantedProperties)
```

Doesn't that look nice! :-D
