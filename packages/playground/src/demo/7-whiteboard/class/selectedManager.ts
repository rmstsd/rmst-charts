import { makeAutoObservable } from 'mobx'
import WhiteboardEditor from '../whiteboardEditor'
import { cloneDeep, pull } from 'es-toolkit'
import { applyToPoint, compose, identity, Matrix, rotate, translate } from 'transformation-matrix'
import { Circle, Group, Line, Rect } from 'rmst-render'
import svgPath from 'svgpath'
import { IGraph } from '../type'
import { Graph_Id } from '../constant'
import { primaryColor } from '../color'
import { TransformOrigin } from './ToolManager/constant'
import EventEmitter from 'rmst-render/event_emitter'

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

  get selectBox() {
    if (this.selectedIds.length === 0) {
      return null
    }

    if (this.selectedIds.length === 1) {
      const sel = this.selectedGraphs[0]

      const graData = sel.graphShape.data

      const bbox = sel.graphShape.getBBox()

      const tl = { x: 0, y: 0 }
      const tr = { x: bbox.width, y: 0 }
      const br = { x: bbox.width, y: bbox.height }
      const bl = { x: 0, y: bbox.height }

      const rot = { x: bbox.width / 2, y: -20 }

      const mt = compose(this.wbEditor.graphLayer.data.mt, graData.mt)

      const tlCoord = applyToPoint(mt, tl)
      const trCoord = applyToPoint(mt, tr)
      const brCoord = applyToPoint(mt, br)
      const blCoord = applyToPoint(mt, bl)

      const rotCoord = applyToPoint(mt, rot)

      return { tlCoord, trCoord, brCoord, blCoord, rotCoord }
    }
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

      return { selfCoordSys, graphLayerCoordSys }
    }
  }

  bindEvent() {
    const { wbEditor } = this

    wbEditor.camera.eventEmitter.on('cameraChange', () => {
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

    this.renderSelected()
  }

  triggerSelectedChange() {
    this.eventEmitter.emit('selectedChange', this.selectedGraphs)
  }

  clearSelect() {
    this.selectedIds = []
    this.renderSelected()
  }

  renderSelected() {
    const sel = this.selectedGraphs[0]

    if (!sel) {
      this.wbEditor.selectLayer.selectToolGroup.removeAllChildren()
      return
    }

    const { tlCoord, trCoord, brCoord, blCoord, rotCoord } = this.selectBox

    const selFrame = new Line({
      id: Graph_Id.graph_ctrl_translate,
      points: [tlCoord.x, tlCoord.y, trCoord.x, trCoord.y, brCoord.x, brCoord.y, blCoord.x, blCoord.y],
      closed: true,
      fillStyle: 'transparent',
      strokeStyle: primaryColor,
      lineWidth: 2
    })

    const ctrlSize = 12

    const rad = calcRotateRad(sel.graphShape.data.mt)

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
      extraData: { transformOrigin: TransformOrigin.tl }
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
      extraData: { transformOrigin: TransformOrigin.tr }
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
      extraData: { transformOrigin: TransformOrigin.br }
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
      extraData: { transformOrigin: TransformOrigin.bl }
    })

    const rotateCircle = new Circle({
      id: Graph_Id.graph_ctrl_rotate,
      x: rotCoord.x,
      y: rotCoord.y,
      radius: ctrlSize / 2,
      fillStyle: 'white',
      strokeStyle: primaryColor
    })

    const cloned = this.clonedGraphToGraphLayer(sel, { lineWidth: 1 })

    const g = new Group({ name: 'ctrl-box' })
    g.append([cloned, selFrame, tlRect, trRect, brRect, blRect, rotateCircle])

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
      const cloned = this.clonedGraphToGraphLayer(this.hovered)

      hoveredGroup.removeAllChildren()
      hoveredGroup.append(cloned)
    }
  }

  private clonedGraphToGraphLayer(graph: IGraph, attrs = {}) {
    const { wbEditor } = this

    const cloned = graph.graphShape.clone()
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

const calcRotateRad = (mt: Matrix) => {
  const p = { x: 1, y: 0 }
  const cmt = cloneDeep(mt)
  cmt.e = 0
  cmt.f = 0
  const tp = applyToPoint(cmt, p)
  const rad = Math.atan2(tp.y, tp.x)

  return rad
}
