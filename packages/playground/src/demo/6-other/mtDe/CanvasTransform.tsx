import { useEffect, useRef, useState } from 'react'
import { AnimatorSingle } from 'rmst-render'
import { applyToPoint, compose, inverse, Matrix, scale, translate } from 'transformation-matrix'

export default function Mt() {
  useEffect(() => {
    const containerStyle = { width: 600, height: 500 }

    let aniCtrl = new AnimatorSingle(1, 2)

    const canvas = document.querySelector('canvas')
    const zoomFit = document.querySelector('.zoom-fit') as HTMLButtonElement
    const zoomFitAni = document.querySelector('.zoom-fit.ani') as HTMLButtonElement
    const zoomT1 = document.querySelector('.zoom-t-1') as HTMLButtonElement
    const zoomT1Ani = document.querySelector('.zoom-t-1.ani') as HTMLButtonElement
    const hideBtn = document.querySelector('.hide-btn') as HTMLButtonElement
    const gunBtn = document.querySelector('.gun') as HTMLButtonElement

    const minimapSvg = document.querySelector('.minimap-svg') as SVGElement

    const miniMap = new MiniMap(document.querySelector('#miniMap'))

    canvas.style.setProperty('width', containerStyle.width + 'px')
    canvas.style.setProperty('height', containerStyle.height + 'px')

    const ctx = canvas.getContext('2d')

    const dpr = 3 // window.devicePixelRatio
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const mtDpi = scale(dpr, dpr, 0, 0)

    const canvasCoordSize = applyToPoint(inverse(mtDpi), { x: canvas.width, y: canvas.height })

    let zoom = 1
    const center = { x: 0, y: 0 }

    // let mt = compose(translate(0, canvasCoordSize.y), scale(zoom, -zoom, center.x, center.y))
    let mt = scale(zoom, zoom, center.x, center.y)

    const rects = [{ x: 100, y: 60, width: 30, height: 20 }]
    rects.push(
      ...[
        { x: 282.29999999999995, y: 227.15, width: 50, height: 40 },
        { x: 529.2816103125001, y: 169.45379937499996, width: 50, height: 40 },
        { x: 281.6829871875001, y: 138.82304187499994, width: 50, height: 40 },
        { x: 0.9010434374999647, y: 134.99419718749994, width: 50, height: 40 },
        { x: 662.0148928125002, y: 161.79610999999994, width: 50, height: 40 },
        { x: -59.121315435301156, y: 277.75900091981157, width: 50, height: 40 }
      ]
    )

    let boxRect = { x: 0, y: 0, width: 0, height: 0 }

    let isTriggerDrag = false

    let isSpaceKeyDown = false
    document.onkeydown = evt => {
      if (evt.code === 'Space') {
        if (isSpaceKeyDown) return
        isSpaceKeyDown = true
      }
    }
    document.onkeyup = evt => {
      if (evt.code === 'Space') {
        isSpaceKeyDown = false
      }
    }

    let isMove = false
    let dp
    let downOffset = { x: 0, y: 0 }

    let isBoxDown = false

    const side = document.querySelector('.side') as HTMLDivElement
    hideBtn.onclick = () => {
      side.hidden = !side.hidden

      mt = compose(mt, translate(side.hidden ? 90 / zoom : -90 / zoom, 0))
      drawStage()
    }

    canvas.onpointerdown = evt => {
      downOffset = { x: evt.offsetX, y: evt.offsetY }
      dp = applyToPoint(inverse(mt), downOffset)

      {
        isBoxDown = true
        boxRect.x = dp.x
        boxRect.y = dp.y
      }

      if (isSpaceKeyDown) {
        isMove = true
      }
    }
    canvas.onpointerup = evt => {
      isMove = false

      {
        isBoxDown = false
        boxRect.x = 0
        boxRect.y = 0
        boxRect.width = 0
        boxRect.height = 0
      }

      drawStage()

      requestAnimationFrame(() => {
        isTriggerDrag = false
      })
    }
    canvas.onpointermove = evt => {
      const moveOffset = { x: evt.offsetX, y: evt.offsetY }
      const mp = applyToPoint(inverse(mt), moveOffset)
      if (isBoxDown) {
        isTriggerDrag = true
        boxRect.width = mp.x - boxRect.x
        boxRect.height = mp.y - boxRect.y

        drawStage()
      }
      if (isMove) {
        isTriggerDrag = true

        const tmt = translate(mp.x - dp.x, mp.y - dp.y)
        mt = compose(mt, tmt)
        drawStage()
      }
    }

    canvas.onclick = evt => {
      if (isTriggerDrag) {
        return
      }

      const center = { x: evt.offsetX, y: evt.offsetY }
      const p = applyToPoint(inverse(mt), center)
      rects.push({ x: p.x, y: p.y, width: 50, height: 40 })

      drawStage()
    }

    gunBtn.onclick = () => {
      aniCtrl.stop()
      aniCtrl = new AnimatorSingle(0, 100, { duration: 200 })

      // mt = compose(mt, translate(0, 100))
      // drawStage()
      // return

      let pmt = { ...mt }
      aniCtrl.onUpdate = val => {
        console.log(val)

        mt = compose(pmt, translate(0, val))
        drawStage()
      }
      aniCtrl.start()
    }

    zoomT1Ani.onclick = () => {
      const newMt = scale(1, 1, center.x, center.y)
      aniCtrl.stop()
      aniCtrl = new AnimatorSingle(0, 1)
      const oldMt = { ...mt }
      aniCtrl.onUpdate = (val, elapsedTimeRatio) => {
        const esMt = { ...oldMt }
        Object.keys(oldMt).forEach(key => {
          esMt[key] = oldMt[key] + (newMt[key] - oldMt[key]) * elapsedTimeRatio
        })

        mt = esMt
        drawStage()
      }
      aniCtrl.start()
    }

    zoomT1.onclick = () => {
      const newMt = scale(1, 1, center.x, center.y)
      mt = newMt
      drawStage()
    }

    zoomFit.onclick = () => {
      mt = getZoomFitMt()

      drawStage()
    }

    function getZoomFitMt() {
      const aroundSpace = 10
      const contentRect = getContentRect()

      ctx.strokeStyle = 'blue'
      ctx.strokeRect(contentRect.x, contentRect.y, contentRect.width, contentRect.height)

      const p1 = { x: 0, y: 0 }

      const stageRect = {
        x: p1.x + aroundSpace,
        y: p1.y + aroundSpace,
        width: canvasCoordSize.x - aroundSpace * 2,
        height: canvasCoordSize.y - aroundSpace * 2
      }

      const zoomX = stageRect.width / contentRect.width
      const zoomY = stageRect.height / contentRect.height
      zoom = Math.min(zoomX, zoomY)

      const scaleMt = compose(
        translate(-contentRect.x + stageRect.x, -contentRect.y + stageRect.y),
        scale(zoom, zoom, contentRect.x, contentRect.y)
      )

      let tx = 0
      let ty = 0

      {
        const ppp = applyToPoint(inverse(scale(zoom)), { x: stageRect.width, y: stageRect.height })
        if (zoomX > zoomY) {
          tx = (ppp.x - contentRect.width) / 2
        } else if (zoomX < zoomY) {
          ty = (ppp.y - contentRect.height) / 2
        }
      }

      const newMt = compose(scaleMt, translate(tx, ty))
      return newMt
    }

    zoomFitAni.onclick = () => {
      const newMt = getZoomFitMt()
      aniCtrl.stop()
      aniCtrl = new AnimatorSingle(0, 1)
      const oldMt = { ...mt }
      aniCtrl.onUpdate = (val, elapsedTimeRatio) => {
        const esMt = { ...oldMt }
        Object.keys(oldMt).forEach(key => {
          esMt[key] = oldMt[key] + (newMt[key] - oldMt[key]) * elapsedTimeRatio
        })

        mt = esMt
        drawStage()
      }
      aniCtrl.start()
    }

    minimapSvg.onpointerdown = evt => {
      const downClient = { x: evt.clientX, y: evt.clientY }
      const abCt = new AbortController()

      document.addEventListener(
        'pointermove',
        evt => {
          const dx = evt.clientX - downClient.x
          const dy = evt.clientY - downClient.y

          downClient.x = evt.clientX
          downClient.y = evt.clientY

          const moveScale = stateRef.current.viewScale * Math.max(mt.a, Math.log(mt.a))
          const position = {
            x: mt.e - dx * moveScale,
            y: mt.f - dy * moveScale
          }

          mt = compose(translate(position.x, position.y), scale(zoom, zoom, center.x, center.y))
          drawStage()
        },
        { signal: abCt.signal }
      )

      document.addEventListener(
        'pointerup',
        evt => {
          abCt.abort()
        },
        { signal: abCt.signal }
      )
    }

    canvas.addEventListener('wheel', evt => {
      evt.preventDefault()

      if (evt.ctrlKey) {
        const center = { x: evt.offsetX, y: evt.offsetY }
        const nvOrigin = applyToPoint(inverse(mt), center)

        const newMt = scale(zoom, zoom, nvOrigin.x, nvOrigin.y)
        const tt = compose(mt, inverse(newMt))

        zoom = evt.deltaY > 0 ? zoom / 1.05 : zoom * 1.05
        mt = compose(tt, scale(zoom, zoom, nvOrigin.x, nvOrigin.y))

        drawStage()
      } else {
        const speed = 30
        if (evt.shiftKey) {
          const tmt = evt.deltaY > 0 ? translate(-speed, 0) : translate(speed, 0)
          mt = compose(tmt, mt)
          drawStage()
        } else {
          const tmt = evt.deltaY > 0 ? translate(0, -speed) : translate(0, speed)
          mt = compose(tmt, mt)
          drawStage()
        }
      }
    })

    drawStage()

    function drawStage() {
      mtRef.current = mt
      ctx.resetTransform()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(mtDpi)

      {
        ctx.save()
        ctx.transform(mt.a, mt.b, mt.c, mt.d, mt.e, mt.f)

        rects.forEach(item => {
          ctx.beginPath()
          ctx.fillRect(item.x, item.y, item.width, item.height)
        })

        // ctx.save()

        // const mtText = compose(translate(0, 22), scale(1, -1, 0, 0))
        // ctx.transform(mtText.a, mtText.b, mtText.c, mtText.d, mtText.e, mtText.f)

        // ctx.font = '20px 微软雅黑'
        // ctx.textBaseline = 'hanging'
        // ctx.fillText('哈哈哈 x l y h', 0, 0)
        // ctx.restore()

        ctx.restore()
      }

      {
        const contentRect = getContentRect()
        const p1 = { x: contentRect.x, y: contentRect.y }
        const p2 = { x: contentRect.x + contentRect.width, y: contentRect.y + contentRect.height }

        const pp1 = applyToPoint(mt, p1)
        const pp2 = applyToPoint(mt, p2)

        ctx.strokeStyle = 'red'
        ctx.strokeRect(pp1.x, pp1.y, pp2.x - pp1.x, pp2.y - pp1.y)

        const viewportRect = { x: 0, y: 0, width: canvasCoordSize.x, height: canvasCoordSize.y }

        setRects(rects)
        const ans = miniMap.draw(mt, contentRect, viewportRect)
        setState(ans)

        {
          const miniCtx = miniMap.ctx
          const miniCanvas = miniMap.canvas

          miniCtx.resetTransform()
          miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height)

          const sc = ans.elementWidth / ans.width
          const sy = ans.elementHeight / ans.height

          const scaleAns = Math.min(sc, sy)
          const tx = -ans.x * scaleAns
          const ty = -ans.y * scaleAns
          miniCtx.translate(tx, ty)
          miniCtx.scale(scaleAns, scaleAns)

          rects.forEach(item => {
            miniCtx.fillStyle = 'blue'
            miniCtx.fillRect(item.x, item.y, item.width, item.height)
          })

          miniCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          miniCtx.fillRect(ans.viewBB.x, ans.viewBB.y, ans.viewBB.width, ans.viewBB.height)
        }

        {
          const p1 = { x: boxRect.x, y: boxRect.y }
          const p2 = { x: boxRect.x + boxRect.width, y: boxRect.y + boxRect.height }
          const p1Coord = applyToPoint(mt, p1)
          const p2Coord = applyToPoint(mt, p2)
          ctx.strokeStyle = 'blue'
          ctx.strokeRect(p1Coord.x, p1Coord.y, p2Coord.x - p1Coord.x, p2Coord.y - p1Coord.y)
        }
      }
    }

    function getContentRect() {
      // 获取所有 rects 的边界 组成一个矩形
      const rectsRect = {
        x: Math.min(...rects.map(item => item.x)),
        y: Math.min(...rects.map(item => item.y)),
        x2: Math.max(...rects.map(item => item.x + item.width)),
        y2: Math.max(...rects.map(item => item.y + item.height))
      }

      const contentRect = {
        x: rectsRect.x,
        y: rectsRect.y,
        width: rectsRect.x2 - rectsRect.x,
        height: rectsRect.y2 - rectsRect.y
      }

      return contentRect
    }
  }, [])

  const mtRef = useRef<Matrix>()

  const [state, setState] = useState({
    elementWidth: 0,
    elementHeight: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    d: '',
    boundingRect: { x: 0, y: 0, width: 0, height: 0 },
    viewScale: 1,
    viewBB: { x: 0, y: 0, width: 0, height: 0 }
  })
  const stateRef = useRef(state)
  stateRef.current = state
  const [rects, setRects] = useState([])

  const sc = state.elementWidth / state.width || 0.000000000000000001
  const sy = state.elementHeight / state.height || 0.000000000000000001

  const scaleAns = Math.min(sc, sy)
  const tx = -state.x * scaleAns
  const ty = -state.y * scaleAns

  return (
    <div className="relative">
      <div className="flex mb-2 gap-2">
        <button className="hide-btn">hide</button>
        <button className="zoom-fit">zoom fit</button>
        <button className="zoom-fit ani">zoom fit 动画</button>
        <button className="zoom-t-1">zoom to 1</button>
        <button className="zoom-t-1 ani">zoom to 1 动画</button>
        <button className="gun">滚</button>
      </div>

      <div className="flex">
        <div className="shadow-border side" style={{ width: 90 }}>
          123
        </div>
        <canvas className="shadow-border"></canvas>
      </div>

      <div className="flex gap-2">
        <canvas className="border-2" id="miniMap" width={300} height={150} style={{ borderColor: 'red' }}></canvas>
        <svg
          className="border minimap-svg"
          width={state.elementWidth}
          height={state.elementHeight}
          viewBox={`${state.x} ${state.y} ${state.width} ${state.height}`}
        >
          {rects.map((item, index) => (
            <rect key={index} x={item.x} y={item.y} width={item.width} height={item.height} fill="blue" />
          ))}

          <path
            className="react-flow__minimap-mask"
            d={state.d}
            fillRule="evenodd"
            pointerEvents="none"
            fill="rgba(0,0,0,0.1)"
            stroke="red"
            strokeWidth={2}
          />
        </svg>

        <svg className="border minimap-svg" width={state.elementWidth} height={state.elementHeight}>
          <g transform={`translate(${tx}, ${ty}) scale(${scaleAns})`}>
            {rects.map((item, index) => (
              <rect key={index} x={item.x} y={item.y} width={item.width} height={item.height} fill="blue" />
            ))}

            <rect
              x={state.viewBB.x}
              y={state.viewBB.y}
              width={state.viewBB.width}
              height={state.viewBB.height}
              fill="rgba(0,0,0,0.3)"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}

class MiniMap {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  get size() {
    return { width: this.canvas.width, height: this.canvas.height }
  }

  draw(mt: Matrix, contentRect, viewportRect) {
    const ans = calc(mt, contentRect, viewportRect.width, viewportRect.height)

    return ans
  }
}

function calc(mt, boundingRect, viewportWidth, viewportWHeight) {
  const defaultWidth = 300
  const defaultHeight = 150

  const viewBB = { x: -mt.e / mt.a, y: -mt.f / mt.a, width: viewportWidth / mt.a, height: viewportWHeight / mt.a }

  boundingRect = getBoundsOfRects(viewBB, boundingRect)

  const elementWidth = defaultWidth
  const elementHeight = defaultHeight

  const scaledWidth = boundingRect.width / elementWidth
  const scaledHeight = boundingRect.height / elementHeight

  // 大地图与小地图的比例
  const viewScale = Math.max(scaledWidth, scaledHeight)

  const viewWidth = viewScale * elementWidth
  const viewHeight = viewScale * elementHeight

  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2
  const width = viewWidth
  const height = viewHeight

  const d = `M${x},${y}h${width}v${height}h${-width}z
M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`

  return { elementWidth, elementHeight, x, y, width, height, d, boundingRect, viewScale, viewBB }
}

const getBoundsOfBoxes = (box1: Box, box2: Box): Box => ({
  x: Math.min(box1.x, box2.x),
  y: Math.min(box1.y, box2.y),
  x2: Math.max(box1.x2, box2.x2),
  y2: Math.max(box1.y2, box2.y2)
})

const rectToBox = ({ x, y, width, height }: Rect): Box => ({ x, y, x2: x + width, y2: y + height })

const boxToRect = ({ x, y, x2, y2 }: Box): Rect => ({ x, y, width: x2 - x, height: y2 - y })

const getBoundsOfRects = (rect1: Rect, rect2: Rect): Rect => {
  return boxToRect(getBoundsOfBoxes(rectToBox(rect1), rectToBox(rect2)))
}

type XYPosition = { x: number; y: number }

type Dimensions = { width: number; height: number }

type Rect = Dimensions & XYPosition

type Box = XYPosition & { x2: number; y2: number }
