import { Group, Line, mergeBox, Rect, Text } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { noop } from 'es-toolkit'
import OpenColor from 'open-color'
import { applyToPoint, rotateDEG } from 'transformation-matrix'
import { Graph_Id, Ruler_Direction } from '../constant'

const tickSize = 6

const borderColor = OpenColor.gray[4]
const tickColor = OpenColor.gray[6]

export const rulerSize = 18

export class Ruler {
  constructor(private wbEditor: WhiteboardEditor) {}

  rulerData = {
    horizontal: [] as { id: string; pos: number }[],
    vertical: [] as { id: string; pos: number }[]
  }

  addRuler(type: 'horizontal' | 'vertical', id: string, pos: number) {
    this.rulerData[type].push({ id, pos })
  }

  updateRuler(type: 'horizontal' | 'vertical', id: string, pos: number) {
    const index = this.rulerData[type].findIndex(item => item.id === id)
    if (index !== -1) {
      this.rulerData[type][index].pos = pos
    }

    this.drawRuler()
  }

  removeRuler(id: string) {
    Object.keys(this.rulerData).forEach(key => {
      this.rulerData[key] = this.rulerData[key].filter(item => item.id !== id)
    })

    this.drawRuler()
  }

  unbind = noop

  bindEvent() {
    this.drawRuler()

    const u1 = this.wbEditor.camera.eventEmitter.on('cameraChange', () => {
      this.drawRuler()
    })
    const u2 = this.wbEditor.eventEmitter.on('render', () => {
      this.drawRuler()
    })
    this.wbEditor.stage.resizeMng.onResize = () => {
      this.drawRuler()
    }

    this.unbind = () => {
      u1()
      u2()
    }
  }

  dispose() {
    this.unbind()
  }

  drawRuler() {
    const { camera, coordSys, rulerLayer, selectManager } = this.wbEditor
    const { viewportSize } = coordSys

    const rulerViewSize = { width: viewportSize.width + rulerSize, height: viewportSize.height + rulerSize }

    rulerLayer.removeAllChildren()

    const { selectedGraphs } = selectManager
    const highlightData = selectedGraphs.map(item => {
      const data = item.data
      const tl = applyToPoint(data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(data.mt, { x: data.width, y: 0 })
      const br = applyToPoint(data.mt, { x: data.width, y: data.height })
      const bl = applyToPoint(data.mt, { x: 0, y: data.height })
      return mergeBox([{ tl, tr, br, bl }])
    })

    const xHighlightRects = highlightData.map(item => {
      const p1 = coordSys.scene2World({ x: item.minX, y: 0 })
      const p2 = coordSys.scene2World({ x: item.maxX, y: 0 })
      return new Rect({ x: p1.x + rulerSize, y: 0, width: p2.x - p1.x, height: rulerSize, fillStyle: OpenColor.indigo[0] })
    })
    const yHighlightRects = highlightData.map(item => {
      const p1 = coordSys.scene2World({ x: 0, y: item.minY })
      const p2 = coordSys.scene2World({ x: 0, y: item.maxY })
      return new Rect({ x: 0, y: p1.y + rulerSize, width: rulerSize, height: p2.y - p1.y, fillStyle: OpenColor.indigo[0] })
    })

    const tx = this.wbEditor.graphLayer.data.mt.e + rulerSize
    const ty = this.wbEditor.graphLayer.data.mt.f + rulerSize

    const gap = getGap(camera.zoom)
    const xTicksData = calcTicks(rulerViewSize.width, tx, camera.zoom, gap)
    const yTicksData = calcTicks(rulerViewSize.height, ty, camera.zoom, gap)

    const g_x = new Group({ pointerEvents: 'none' })
    const rect_bg_x = new Rect({ width: rulerViewSize.width, height: rulerSize, fillStyle: 'white' })

    g_x.append(
      rect_bg_x,
      new Line({ points: [0, rulerSize, rulerViewSize.width, rulerSize], strokeStyle: borderColor }),
      ...xHighlightRects
    )
    for (const item of xTicksData) {
      g_x.append(new Line({ points: [item.coord, rulerSize - tickSize, item.coord, rulerSize], strokeStyle: borderColor }))
      g_x.append(new Text({ content: item.text, x: item.coord, fontSize: 12, y: 4, fillStyle: tickColor }))
    }

    const g_y = new Group({ pointerEvents: 'none' })
    const rect_bg_y = new Rect({ width: rulerSize, height: rulerViewSize.height, fillStyle: 'white' })
    g_y.append(
      rect_bg_y,
      new Line({ points: [rulerSize, 0, rulerSize, rulerViewSize.height], strokeStyle: borderColor }),
      ...yHighlightRects
    )
    for (const item of yTicksData) {
      g_y.append(new Line({ points: [rulerSize - tickSize, item.coord, rulerSize, item.coord], strokeStyle: borderColor }))
      g_y.append(new Text({ content: item.text, x: 4, y: item.coord, fontSize: 12, fillStyle: tickColor, mt: rotateDEG(-90) }))
    }

    const ruler_tl = new Group({ pointerEvents: 'none' })
    const rect_tl = new Rect({ width: rulerSize, height: rulerSize, fillStyle: 'white' })
    const border = new Line({ points: [rulerSize, 0, rulerSize, rulerSize, 0, rulerSize], strokeStyle: borderColor })

    ruler_tl.append(rect_tl, border)

    rulerLayer.append(g_x, g_y, ruler_tl)

    {
      // 图形拾取
      const rect_tl_cloned = rect_tl.clone()
      rect_tl_cloned.attr({ id: Graph_Id.ruler_zone_both, opacity: 0 })

      const rect_bg_x_cloned = rect_bg_x.clone()
      const rect_bg_y_cloned = rect_bg_y.clone()
      rect_bg_x_cloned.attr({ id: Graph_Id.ruler_zone_horizontal, opacity: 0 })
      rect_bg_y_cloned.attr({ id: Graph_Id.ruler_zone_vertical, opacity: 0 })

      rulerLayer.append(rect_bg_x_cloned, rect_bg_y_cloned, rect_tl_cloned)
    }

    {
      const horizontal = this.rulerData.horizontal.map(item => {
        const coord = this.wbEditor.coordSys.scene2World({ x: 0, y: item.pos })
        const y = coord.y + rulerSize

        return new Line({
          id: item.id,
          points: [0, y, rulerViewSize.width, y],
          strokeStyle: OpenColor.red[5],
          visible: coord.y > 0,
          extraData: {
            type: Ruler_Direction.ruler_line_horizontal
          }
        })
      })
      const vertical = this.rulerData.vertical.map(item => {
        const coord = this.wbEditor.coordSys.scene2World({ x: item.pos, y: 0 })
        const x = coord.x + rulerSize

        return new Line({
          id: item.id,
          points: [x, 0, x, rulerViewSize.height],
          strokeStyle: OpenColor.red[5],
          visible: coord.x > 0,
          extraData: {
            type: Ruler_Direction.ruler_line_vertical
          }
        })
      })

      const rulerLineGroup = new Group({ name: 'rulerLineGroup' })
      rulerLineGroup.append([...horizontal, ...vertical])
      rulerLayer.append(rulerLineGroup)
    }
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
