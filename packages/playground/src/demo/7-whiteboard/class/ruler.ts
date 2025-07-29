import { Group, Line, Rect, Text } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { noop } from 'es-toolkit'
import OpenColor from 'open-color'
import { rotateDEG } from 'transformation-matrix'
import { Graph_Id } from '../constant'

const tickSize = 6

const borderColor = OpenColor.gray[4]
const tickColor = OpenColor.gray[6]

export const rulerSize = 18

export class Ruler {
  constructor(private wbEditor: WhiteboardEditor) {}

  unbind = noop

  bindEvent() {
    this.drawRuler()

    this.unbind = this.wbEditor.camera.eventEmitter.on('cameraChange', () => {
      this.drawRuler()
    })

    this.wbEditor.stage.resizeMng.onResize = () => {
      this.drawRuler()
    }
  }

  dispose() {
    this.unbind()
  }

  drawRuler() {
    const { camera, coordSys, rulerLayer } = this.wbEditor
    const { viewportSize } = coordSys

    const rulerViewSize = { width: viewportSize.width + rulerSize, height: viewportSize.height + rulerSize }

    rulerLayer.removeAllChildren()

    const tx = this.wbEditor.graphLayer.data.mt.e + rulerSize
    const ty = this.wbEditor.graphLayer.data.mt.f + rulerSize

    const gap = getGap(camera.zoom)
    const xTicksData = calcTicks(rulerViewSize.width, tx, camera.zoom, gap)
    const yTicksData = calcTicks(rulerViewSize.height, ty, camera.zoom, gap)

    const g_x = new Group()
    g_x.append(
      new Rect({ id: Graph_Id.ruler_assist_line_x, width: rulerViewSize.width, height: rulerSize, fillStyle: 'white' }),
      new Line({ points: [0, rulerSize, rulerViewSize.width, rulerSize], strokeStyle: borderColor })
    )
    for (const item of xTicksData) {
      g_x.append(new Line({ points: [item.coord, rulerSize - tickSize, item.coord, rulerSize], strokeStyle: borderColor }))
      g_x.append(new Text({ content: item.text, x: item.coord, fontSize: 12, y: 4, fillStyle: tickColor }))
    }

    const g_y = new Group()
    g_y.append(
      new Rect({ id: Graph_Id.ruler_assist_line_y, width: rulerSize, height: rulerViewSize.height, fillStyle: 'white' }),
      new Line({ points: [rulerSize, 0, rulerSize, rulerViewSize.height], strokeStyle: borderColor })
    )
    for (const item of yTicksData) {
      g_y.append(new Line({ points: [rulerSize - tickSize, item.coord, rulerSize, item.coord], strokeStyle: borderColor }))
      g_y.append(new Text({ content: item.text, x: 4, y: item.coord, fontSize: 12, fillStyle: tickColor, mt: rotateDEG(-90) }))
    }

    const rect_tl = new Rect({ id: Graph_Id.ruler_assist_line_both, width: rulerSize, height: rulerSize, fillStyle: 'white' })
    const border = new Line({ points: [rulerSize, 0, rulerSize, rulerSize, 0, rulerSize], strokeStyle: borderColor })

    rulerLayer.append(g_x, g_y, rect_tl, border)
  }
}

function getGap(zoom: number) {
  const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
  const gaps = [5000, 2500, 1000, 500, 200, 100, 50, 20, 10]

  let i = 0
  while (i < zooms.length && zooms[i] < zoom) {
    i++
  }
  return gaps[i - 1] || 10000
}

const calcTicks = (canvasSize: number, translate: number, scale: number, gap: number) => {
  const startXRealTick = -(translate / scale)
  const xStartValue = Math.floor(startXRealTick / gap) * gap
  const xTickCount = Math.ceil(canvasSize / scale / gap)
  const xTicks = [xStartValue]
  for (let i = 0; i < xTickCount; i++) {
    const cur = xTicks.at(-1) + gap
    xTicks.push(cur)
  }
  const xTicksData = xTicks.map(item => ({ coord: item * scale + translate, text: item.toString() }))

  return xTicksData
}
