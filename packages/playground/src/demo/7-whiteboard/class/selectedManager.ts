import WhiteboardEditor from '../whiteboardEditor'
import { cloneDeep, pull } from 'es-toolkit'
import { applyToPoint, compose, identity, Matrix, rotate, translate } from 'transformation-matrix'
import { calcMidPoint, distanceTowPoint, Group, Line, Rect, Text } from 'rmst-render'
import svgPath from 'svgpath'
import { IGraph } from '../type'
import { calcRotateRad, Graph_Id } from '../constant'
import { primaryColor } from '../color'
import { TransformOrigin } from './ToolManager/constant'
import EventEmitter from 'rmst-render/event_emitter'
import colorAlpha from 'color-alpha'
import { mergeBox } from '@/demo/6-other/mtDe/Xg_multi/util'

let debugHandle = true

const ctrlSize = 12
const rotateSize = ctrlSize * 2

interface Events {
  selectedChange: (selectedGraphs: IGraph[]) => void // 选中变化事件, 以及选中的元素的数据变化
}

export default class selectedManager {
  constructor(private wbEditor: WhiteboardEditor) {}

  eventEmitter = new EventEmitter<Events>()

  private hovered: IGraph
  private enabledHover = true

  selectedIds: string[] = []

  get selectedGraphs() {
    return this.wbEditor.graphs.filter(g => this.selectedIds.includes(g.id))
  }

  get transformDownRect() {
    if (this.selectedIds.length === 1) {
      const sel = this.selectedGraphs[0]

      const graData = sel.graphShape.data

      const bbox = sel.graphShape.getBBox()

      const tl = { x: 0, y: 0 }
      const tr = { x: bbox.width, y: 0 }
      const br = { x: bbox.width, y: bbox.height }
      const bl = { x: 0, y: bbox.height }

      const selfCoordSys = { tl, tr, br, bl }

      const graphLayerCoordSys = {
        tl: applyToPoint(graData.mt, tl),
        tr: applyToPoint(graData.mt, tr),
        br: applyToPoint(graData.mt, br),
        bl: applyToPoint(graData.mt, bl)
      }

      return {
        // selfCoordSys,
        graphLayerCoordSys,
        downRect: {
          width: sel.graphShape.data.width,
          height: sel.graphShape.data.height,
          mt: cloneDeep(sel.graphShape.data.mt)
        }
      }
    }

    // 多个
    const selRects = this.selectedGraphs.map(item => {
      const data = item.graphShape.data
      const tl = applyToPoint(data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(data.mt, { x: data.width, y: 0 })
      const br = applyToPoint(data.mt, { x: data.width, y: data.height })
      const bl = applyToPoint(data.mt, { x: 0, y: data.height })
      return { tl, tr, br, bl }
    })

    const { minX, minY, maxX, maxY } = mergeBox(selRects)

    return {
      // selfCoordSys,
      // graphLayerCoordSys,
      downRect: {
        width: maxX - minX,
        height: maxY - minY,
        mt: translate(minX, minY)
      }
    }
  }

  bindEvent() {
    const { wbEditor } = this

    wbEditor.camera.eventEmitter.on('cameraChange', () => {
      this.renderSelected()
      this.renderHovered()
    })

    wbEditor.eventEmitter.on('render', () => {
      this.renderSelected()
      this.renderHovered()
    })
  }

  select(id: string) {
    this.selectedIds = []

    if (this.selectedIds.includes(id)) {
      pull(this.selectedIds, [id])
    } else {
      this.selectedIds.push(id)
    }
  }

  batchSelect(ids: string[]) {
    this.selectedIds = ids
  }

  clearSelect() {
    this.selectedIds = []
  }

  private renderSelected() {
    if (!this.selectedIds.length) {
      this.wbEditor.selectLayer.selectToolGroup.removeAllChildren()
      return
    }

    const { downRect } = this.transformDownRect

    const tl = { x: 0, y: 0 }
    const tr = { x: downRect.width, y: 0 }
    const br = { x: downRect.width, y: downRect.height }
    const bl = { x: 0, y: downRect.height }

    const mtWorld = compose(this.wbEditor.graphLayer.data.mt, downRect.mt)

    const tlCoord = applyToPoint(mtWorld, tl)
    const trCoord = applyToPoint(mtWorld, tr)
    const brCoord = applyToPoint(mtWorld, br)
    const blCoord = applyToPoint(mtWorld, bl)

    const padding = ctrlSize / this.wbEditor.camera.zoom
    const outerBbox = {
      x: -padding,
      y: -padding,
      width: downRect.width + padding * 2,
      height: downRect.height + padding * 2
    }

    const outerBboxCoordWorld = {
      tl: applyToPoint(mtWorld, { x: outerBbox.x, y: outerBbox.y }),
      tr: applyToPoint(mtWorld, { x: outerBbox.x + outerBbox.width, y: outerBbox.y }),
      br: applyToPoint(mtWorld, { x: outerBbox.x + outerBbox.width, y: outerBbox.y + outerBbox.height }),
      bl: applyToPoint(mtWorld, { x: outerBbox.x, y: outerBbox.y + outerBbox.height })
    }

    const selFrame = new Line({
      id: Graph_Id.graph_ctrl_translate,
      points: [tlCoord.x, tlCoord.y, trCoord.x, trCoord.y, brCoord.x, brCoord.y, blCoord.x, blCoord.y],
      closed: true,
      fillStyle: 'transparent',
      strokeStyle: primaryColor,
      lineWidth: 2
    })

    const rad = calcRotateRad(downRect.mt)

    const scaleHandleMt = compose(translate(-ctrlSize / 2, -ctrlSize / 2), rotate(rad, ctrlSize / 2, ctrlSize / 2))
    const tlRect = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      x: tlCoord.x,
      y: tlCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      mt: scaleHandleMt,
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.br }
    })
    const tlText = new Text({
      x: tlCoord.x,
      y: tlCoord.y,
      content: '1',
      pointerEvents: 'none',
      mt: scaleHandleMt
    })
    const trRect = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      x: trCoord.x,
      y: trCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      mt: scaleHandleMt,
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.bl }
    })
    const trText = new Text({
      x: trCoord.x,
      y: trCoord.y,
      content: '2',
      pointerEvents: 'none',
      mt: scaleHandleMt
    })
    const brRect = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      x: brCoord.x,
      y: brCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      mt: scaleHandleMt,
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.tl }
    })
    const brText = new Text({
      x: brCoord.x,
      y: brCoord.y,
      content: '3',
      pointerEvents: 'none',
      mt: scaleHandleMt
    })
    const blRect = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      x: blCoord.x,
      y: blCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      mt: scaleHandleMt,
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.tr }
    })
    const blText = new Text({
      x: blCoord.x,
      y: blCoord.y,
      content: '4',
      pointerEvents: 'none',
      mt: scaleHandleMt
    })

    const clonedOutlines = this.selectedGraphs.map(item => this.clonedOutlineGraphToGraphLayer(item, { lineWidth: 1 }))

    const rotateHandleMt = compose(
      translate(-rotateSize / 2, -rotateSize / 2),
      rotate(rad, rotateSize / 2, rotateSize / 2)
    )
    const rotateHandles = Object.keys(outerBboxCoordWorld).map(item => {
      const val = outerBboxCoordWorld[item]

      return new Rect({
        id: Graph_Id.graph_ctrl_rotate,
        x: val.x,
        y: val.y,
        width: rotateSize,
        height: rotateSize,
        fillStyle: colorAlpha('white', 0.5),
        strokeStyle: primaryColor,
        opacity: debugHandle ? 0.5 : 0,
        cursor: 'grab',
        mt: rotateHandleMt
      })
    })

    const width = distanceTowPoint(tlCoord, trCoord)
    const height = distanceTowPoint(tlCoord, blCoord)
    const hh = ctrlSize

    const top = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(tlCoord, trCoord),
      width: width,
      height: hh,
      fillStyle: 'pink',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-width / 2, -hh / 2), rotate(rad, width / 2, hh / 2)),
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.Bottom }
    })
    const right = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(trCoord, brCoord),
      width: hh,
      height: height,
      fillStyle: 'orange',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-hh / 2, -height / 2), rotate(rad, hh / 2, height / 2)),
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.Left }
    })
    const bottom = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(blCoord, brCoord),
      width: width,
      height: hh,
      fillStyle: 'red',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-width / 2, -hh / 2), rotate(rad, width / 2, hh / 2)),
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.Top }
    })
    const left = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(tlCoord, blCoord),
      width: hh,
      height: height,
      fillStyle: 'purple',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-hh / 2, -height / 2), rotate(rad, hh / 2, height / 2)),
      cursor: 'pointer',
      extraData: { transformOrigin: TransformOrigin.Right }
    })

    const g = new Group({ name: 'ctrl-box' })
    g.append([
      ...clonedOutlines,

      selFrame,

      ...rotateHandles,

      top,
      right,
      bottom,
      left,

      tlRect,
      trRect,
      brRect,
      blRect,
      tlText,
      trText,
      brText,
      blText
    ])

    this.wbEditor.selectLayer.selectToolGroup.removeAllChildren()
    this.wbEditor.selectLayer.selectToolGroup.append(g)
  }

  enableHover() {
    this.enabledHover = true
  }
  disableHover() {
    this.enabledHover = false
    this.hovered = null
    this.renderHovered()
  }

  onHover(id: string, enter: boolean) {
    if (!this.enabledHover) {
      return
    }

    const { wbEditor } = this

    if (enter) {
      this.hovered = wbEditor.graphs.find(g => g.id === id)
    } else {
      this.hovered = null
    }

    this.renderHovered()
  }

  renderHovered() {
    const { wbEditor } = this
    const { hoveredGroup } = wbEditor.selectLayer
    hoveredGroup.removeAllChildren()

    if (this.hovered) {
      const clonedOutline = this.clonedOutlineGraphToGraphLayer(this.hovered)

      hoveredGroup.removeAllChildren()
      hoveredGroup.append(clonedOutline)
    }
  }

  private clonedOutlineGraphToGraphLayer(graph: IGraph, attrs = {}) {
    const { wbEditor } = this

    const cloned = graph.graphShape.getOutLineShape()

    const mt = compose(wbEditor.graphLayer.data.mt, cloned.data.mt)
    const nd = svgPath(cloned.data.d).matrix([mt.a, mt.b, mt.c, mt.d, mt.e, mt.f]).toString()

    cloned.attr({
      d: nd,
      mt: identity(),
      fillStyle: null,
      strokeStyle: primaryColor,
      lineWidth: 2,
      pointerEvents: 'none',
      ...attrs
    })

    return cloned
  }
}
