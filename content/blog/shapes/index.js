const fs = require("fs")
const { createCanvas, loadImage } = require("canvas")
const __dirname = path.resolve(path.dirname(""))

const canvas = createCanvas(500, 200)
const ctx = canvas.getContext("2d")

function drawArc(ctx, x, y) {
  ctx.beginPath()
  ctx.arc(x, y, 50, 0, 2 * Math.PI)
  ctx.stroke()
}

drawArc(ctx, 50, 50)
drawArc(ctx, 150, 50)
drawArc(ctx, 250, 50)
drawArc(ctx, 350, 50)
drawArc(ctx, 450, 50)

drawArc(ctx, 50, 150)
drawArc(ctx, 150, 150)
drawArc(ctx, 250, 150)
drawArc(ctx, 350, 150)
drawArc(ctx, 450, 150)

const buffer = canvas.toBuffer("image/png")

fs.writeFileSync(__dirname + "/content/blog/shapes/test.png", buffer)
