---
title: Querying the NPM Package Registry API
date: 2022-01-25
description: A pattern for recursive fetching.
---

I recently had to query the NPM Package Registry API.
This API will return data about any package in NPM's public registry, including all of the packages that any queried package may depend on.

But there's a catch.
The `dependencies` property of the returned object doesn't contain the full data for each dependency; it only tells us the name and the version of each dependency.
For example, requesting `"https://registry.npmjs.org/d3/latest"` will return the object below.

```json
{
  "name": "d3",
  "version": "latest",
  "dependencies": {
    "d3-array": "3",
    "d3-axis": "3",
    "d3-brush": "3",
    "d3-chord": "3",
    "d3-color": "3",
    "d3-contour": "3",
    "d3-delaunay": "6",
    "d3-dispatch": "3",
    "d3-drag": "3",
    "d3-dsv": "3",
    "d3-ease": "3",
    "d3-fetch": "3",
    "d3-force": "3",
    "d3-format": "3",
    "d3-geo": "3",
    "d3-hierarchy": "3",
    "d3-interpolate": "3",
    "d3-path": "3",
    "d3-polygon": "3",
    "d3-quadtree": "3",
    "d3-random": "3",
    "d3-scale": "4",
    "d3-scale-chromatic": "3",
    "d3-selection": "3",
    "d3-shape": "3",
    "d3-time": "3",
    "d3-time-format": "4",
    "d3-timer": "3",
    "d3-transition": "3",
    "d3-zoom": "3"
  }
}
```

The API response doesn't tell us anything about the dependencies of those dependencies.
But with a little recursion, we can write a function that will query the API again for each dependency.

![D3 package dep tree](./tree.svg)

If we want to get the data about the nested dependencies shown in the visualisation above, the simplest way to do that is to write a function that can recursively query the package registry for every dependency, and for all of the dependency's dependencies.

```js
const { dependencies } = await fetch(
  "https://registry.npmjs.org/d3/latest"
).then(res => res.json())
```

<div class="call-out-indigo">

If you've never seen the [`async` / `await`](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) syntax in JavaScript, it's just syntactic sugar around the Promise API that makes sure that `dependencies` above resolves to the `dependencies` property of the response body, rather than crashing by attempting to deconstruct a Promise instance.

</div>

Fetching the data for the D3 package is simple enough, but we'll need a resource path for fetching each dependency dynamically.
Let's wrap-up the request into a function named `getPkgDeps()` that accepts a `name` and a `version`.

```js
const getPkgDeps = async (name, version) => {
  const { dependencies } = await fetch(
    `https://registry.npmjs.org/${name}/${version}`
  ).then(res => res.json())

  return { name, version, dependencies }
}

await getPkgDeps("d3", "latest") // { name: "d3", version: "latest", dependencies: {} }
```

That same function can be used to get the data for the D3 package, as well as for any of it's dependencies.

## Making it recursive

We want `getPkgDeps()` to query the registry for the package whose name we call it with, but we also need it to be run for every package that the first-order package depends-on.
To do this, the function needs to check whether `dependencies` contains any properties.
If it does, then each of those properties must be used to query the package registry.

```js
typeof dependencies !== "undefined"
? // Fetch the dependency data from the registry.
: // Otherwise return undefined
```

The most elegant way that I know of to do this is to convert the `dependencies` property into an array of key-value pairs via `Object.entries()`, and then `map()` each `[k, v]` to `getPkgDeps()`.

```js
await Promise.all(
  Object.entries(dependencies).map(async ([k, v]) => await getPkgDeps(k, v))
) // [{name: "d3-array", version: "3", dependencies: {} }, ...]
```

However, `Object.entries()` leaves us with an array.
If we want to keep `dependencies` an object, then we'll need an additional step to convert this array back into an object.

`Object.fromEntries()` will create an object from an array of `[k, v]` pairs.
All we need to do is feed the code from the previous block into it...

```js
Object.fromEntries(
  await Promise.all(
    Object.entries(dependencies).map(async ([k, v]) => await getPkgDeps(k, v))
  )
)
```

> `TypeError: Cannot convert undefined or null to object`
>
> "Whoops!"

Not quite.
Remember; `Object.entries()` returned an array of `[k, v]`, so it follows that `Object.fromEntries()` would require an array of `[k, v]` pairs.
We'll need to `map()` each `[k, v]` pair back to a `[k, v]` pair if we want to use `Object.fromEntries()`.

```js
Object.fromEntries(
  await Promise.all(
    Object.entries(dependencies).map(async ([k, v]) => [
      k,
      await getPkgDeps(k, v),
    ])
  )
) // { "d3-array": {name: "d3-array", version: "3", dependencies: {} }, ... }
```

> Much better.

Putting it together looks a little crazy, but it does the job.

```js
const getPkgDeps = async (name, version) => {
  const { dependencies } = await fetch(
    `https://registry.npmjs.org/${name}/${version}`
  ).then(res => res.json())

  return {
    name,
    version,
    dependencies:
      typeof dependencies !== "undefined"
        ? Object.fromEntries(
            await Promise.all(
              Object.entries(dependencies).map(async ([k, v]) => [
                k,
                await getPkgDeps(k, v),
              ])
            )
          )
        : dependencies,
  }
}
```

## One last thing

The NPM package registry API follows the [Semantic Versioning](https://semver.org/) specification.
This means that the `version` portion of the request path must be formatted in a specific way.
This means that `/d3/latest` will work, as will `/d3/7.3.0`, but `/d3/7` will return a `MethodNotAllowedError` because `/d3/7` isn't properly formatted according to the Semantic Versioning spec.
You may have noticed, however, that the `version` for each dependency returned by the API isn't necessarily formatted according to the spec.

The function below (`getSemVer()`) will take a string and check whether it conforms to the Semantic Versioning specification.
If it doesn't, then it will simply return "latest".

```js
const getSemVer = function (version) {
  const re = new RegExp(
    "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
    "gm"
  )

  return version.match(re) !== null ? version : "latest"
}

const getPkgDeps = async (name, version) => {
  const { dependencies } = await fetch(
    `https://registry.npmjs.org/${name}/${getSemVer(version)}`
  ).then(res => res.json())

  return {
    name,
    version,
    dependencies:
      typeof dependencies !== "undefined"
        ? Object.fromEntries(
            await Promise.all(
              Object.entries(dependencies).map(async ([k, v]) => [
                k,
                await getPkgDeps(k, v),
              ])
            )
          )
        : dependencies,
  }
}
```

Voila!

![D3 package dep tree](./tree.svg)
