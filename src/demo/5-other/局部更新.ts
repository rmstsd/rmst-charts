// <canvas style="border: 1px solid #333" width="600" height="400"></canvas>

const c = document.querySelector('canvas')

const color1 = 'rgba(0,0,0,0.5)'
const color2 = 'rgba(0,255,0,0.5)'

const ctx = c.getContext('2d')

ctx.fillStyle = color1
ctx.arc(300, 200, 50, 0, Math.PI * 2, false)
ctx.fill()

ctx.beginPath()
ctx.fillStyle = color2
ctx.arc(350, 150, 50, 0, Math.PI * 2, false)
ctx.fill()

ctx.beginPath()
ctx.fillStyle = 'rgba(0,0,255,0.6)'
ctx.arc(400, 100, 50, 0, Math.PI * 2, false)
ctx.fill()

ctx.beginPath()
ctx.clearRect(250, 150, 100, 100)
ctx.rect(250, 150, 100, 100)
ctx.clip()

ctx.beginPath()
ctx.fillStyle = color1
ctx.arc(300, 200, 50, 0, Math.PI * 2, false)
ctx.fill()

ctx.beginPath()
ctx.fillStyle = color2
ctx.arc(350, 150, 50, 0, Math.PI * 2, false)
ctx.fill()

export default []
