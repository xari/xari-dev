const fs = require("fs")

const beers = JSON.parse(
  fs.readFileSync("./content/blog/data-wrangling-with-js/beers.json")
)

const keepUnique = property => {
  const uniqueSet = new Set()

  return (acc, cur) => {
    const value = cur[property]

    return uniqueSet.has(value)
      ? acc
      : uniqueSet.add(value) && acc.concat(value)
  }
}

const keepUniqueHops = keepUnique("name")

const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter(keepUniqueHops)
