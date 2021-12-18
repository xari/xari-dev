---
title: Data Wrangling and Visualisation with JavaScript
date: 2021-12-08
description: A new series on data wrangling and visualisation with JavaScript.
---

<div class="call-out-indigo">

This is the first post in a series about data wrangling and visualisation with JavaScript.
It exists for developers who want to expand their toolkit with a few versitle tools; namely D3.js, and functional patterns for working with arrays.

You can find the other posts in this series at the links below.

- [Pt. I — Unnesting Arrays](../unnesting-arrays)
- [Pt. II — Reducing Arrays](../reducing-arrays)
- [Pt. III — Intro to D3](../intro-to-d3)
- [Pt. IV — Binding data with D3](../binding-data-d3)
- [Pt. V — Horizontal Bar Plot With D3](../horizontal-bar-plot)

</div>

This series is constructed around a dataset that I pulled from the Punk API.

![Punk API](./punk_api.png)

If you aren't familliar with it yet, the Punk API is maintained by Brewdog, a highly successful brewery in Scotland.
This public REST API can be used to query a database of their entire beer catalogue.
Over the course of this series, we'll work with this data to produce several beautiful visualisations, like the one below.

![Horizontal bar plot of Brewdog's most bitter beers](./plot.svg)

The approach that we'll take is to break-down the steps involved in wrangling and plotting the data into small, digestible pieces.

## 325 beers!

Our first step in this process is to examine the data that we'll be working with.
I requested this data from the [Punk API](https://punkapi.com/), and stored it in a JSON file called `beers.json`.
This file can be fetched in different ways, but I'm working in a Node.js environment, so I'm using the `fs` library for the job of reading and parsing this file.

```js
const beers = JSON.parse(fs.readFileSync("./beers.json"))
```

`beers` is an array of 325 beer objects.

```js
beers // Array(325) [{…}, {…}, {…}, {…}, {…}, …]
```

To quickly check the top-level properties of these beer objects, we can use the `Object.getOwnPropertyNames()` method, shown below.

```js
Object.getOwnPropertyNames(beers[1])
```

From this, we can see that the data stored in these objects relates _mostly_ to the brewing of these beers.

<div class="sm-text">

```json
[
  "id",
  "name",
  "tagline",
  "first_brewed",
  "description",
  "image_url",
  "abv",
  "ibu",
  "target_fg",
  "target_og",
  "ebc",
  "srm",
  "ph",
  "attenuation_level",
  "volume",
  "boil_volume",
  "method",
  "ingredients",
  "food_pairing",
  "brewers_tips",
  "contributed_by"
]
```

</div>

It's a good idea to look-at one of these object though, because `Object.getOwnPropertyNames()` doesn't actually tell us anything about the values of these properties.

<div class="sm-text">

```json
{
    "id": 192,
    "name": "Punk IPA 2007 - 2010",
    "tagline": "Post Modern Classic. Spiky. Tropical. Hoppy.",
    "first_brewed": "04/2007",
    "description": "Our flagship beer that kick started the craft beer revolution. This is James and Martin's original take on an American IPA, subverted with punchy New Zealand hops. Layered with new world hops to create an all-out riot of grapefruit, pineapple and lychee before a spiky, mouth-puckering bitter finish.",
    "image_url": "https://images.punkapi.com/v2/192.png",
    "abv": 6.0,
    "ibu": 60.0,
    "target_fg": 1010.0,
    "target_og": 1056.0,
    "ebc": 17.0,
    "srm": 8.5,
    "ph": 4.4,
    "attenuation_level": 82.14,
    "volume": {
      "value": 20,
      "unit": "liters"
    },
    "boil_volume": {
      "value": 25,
      "unit": "liters"
    },
    "method": {
      "mash_temp": [
        {
          "temp": {
            "value": 65,
            "unit": "celsius"
          },
          "duration": 75
        }
      ],
      "fermentation": {
        "temp": {
          "value": 19.0,
          "unit": "celsius"
        }
      },
      "twist": null
    },
    "ingredients": {
      "malt": [
        {
          "name": "Extra Pale",
          "amount": {
            "value": 5.3,
            "unit": "kilograms"
          }
        }
      ],
      "hops": [
        {
          "name": "Ahtanum",
          "amount": {
            "value": 17.5,
            "unit": "grams"
           },
           "add": "start",
           "attribute": "bitter"
         },
         {
           "name": "Chinook",
           "amount": {
             "value": 15,
             "unit": "grams"
           },
           "add": "start",
           "attribute": "bitter"
         },
         ...
      ],
      "yeast": "Wyeast 1056 - American Ale™"
    },
    "food_pairing": [
      "Spicy carne asada with a pico de gallo sauce",
      "Shredded chicken tacos with a mango chilli lime salsa",
      "Cheesecake with a passion fruit swirl sauce"
    ],
    "brewers_tips": "While it may surprise you, this version of Punk IPA isn't dry hopped but still packs a punch! To make the best of the aroma hops make sure they are fully submerged and add them just before knock out for an intense hop hit.",
    "contributed_by": "Sam Mason <samjbmason>"
  }
```

</div>

We can see from the output above, that some of these properties contain nested objects or nested arrays.
In the next post in this series, we're going to dig-out one of these nested arrays, `ingredients.hops`, which we can see below.
This array shows us that the original Punk IPA uses only two hops: Ahtanum and Chinook.

<div class="sm-text">

```json
[
  {
    "name": "Ahtanum",
    "amount": {
      "value": 17.5,
      "unit": "grams"
    },
    "add": "start",
    "attribute": "bitter"
  },
  {
    "name": "Chinook",
    "amount": {
      "value": 15,
      "unit": "grams"
    },
    "add": "start",
    "attribute": "bitter"
  }
]
```

</div>

Each of the beers in the dataset contains at least one hop.
In the [next post](../unnesting-arrays) in this series, we're going to use simple array methods to create an array that contains the names of all of these hops.
