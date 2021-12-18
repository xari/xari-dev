// Step one: get data

const fs = require("fs")

const beers = JSON.parse(
  fs.readFileSync("./content/blog/data-wrangling-with-js/beers.json")
)

// Step one: get hops from beers

const keepUnique = property => {
  const uniqueSet = new Set()

  return (acc, cur) => {
    const value = cur[property]

    return uniqueSet.has(value)
      ? acc
      : uniqueSet.add(value) && acc.concat(value)
  }
}

console.log(Object.getOwnPropertyNames(beers[1]))
