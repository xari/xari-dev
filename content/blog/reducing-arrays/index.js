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

const hops = beers.reduce((acc, cur) => {
  return cur.ingredients.hops.reduce(keepUniqueHops, acc)
}, [])

// hopsByAttr

const hopsByAttr = beers.reduce((acc, cur) => {
  return cur.ingredients.hops.reduce((acc2, cur2) => {
    return [
      {
        attribute: cur2.attribute,
        hops: [acc2[i].hops, cur2.hops],
      },
    ]
  }, acc)
}, [])
