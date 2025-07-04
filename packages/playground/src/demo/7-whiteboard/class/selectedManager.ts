import WhiteboardEditor from '../whiteboardEditor'
import { cloneDeep, pull } from 'es-toolkit'
import { applyToPoint, compose, identity, Matrix, rotate, translate } from 'transformation-matrix'
import { Circle, Group, Line, Rect, Text } from 'rmst-render'
import svgPath from 'svgpath'
import { IGraph } from '../type'
import { Graph_Id } from '../constant'
import { primaryColor } from '../color'
import { TransformOrigin } from './ToolManager/constant'
import EventEmitter from 'rmst-render/event_emitter'

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

      const mt = compose(this.wbEditor.graphLayer.data.mt, graData.mt)

      const tlCoord = applyToPoint(mt, tl)
      const trCoord = applyToPoint(mt, tr)
      const brCoord = applyToPoint(mt, br)
      const blCoord = applyToPoint(mt, bl)

      const padding = 20 / this.wbEditor.camera.zoom
      const outerBbox = {
        x: bbox.x - padding,
        y: bbox.y - padding,
        width: bbox.width + padding * 2,
        height: bbox.height + padding * 2
      }

      const outerBboxCoordSys = {
        tl: applyToPoint(mt, { x: outerBbox.x, y: outerBbox.y }),
        tr: applyToPoint(mt, { x: outerBbox.x + outerBbox.width, y: outerBbox.y }),
        br: applyToPoint(mt, { x: outerBbox.x + outerBbox.width, y: outerBbox.y + outerBbox.height }),
        bl: applyToPoint(mt, { x: outerBbox.x, y: outerBbox.y + outerBbox.height })
      }

      return { tlCoord, trCoord, brCoord, blCoord, outerBboxCoordSys }
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

      return {
        selfCoordSys,
        graphLayerCoordSys,
        downRect: {
          width: sel.graphShape.data.width,
          height: sel.graphShape.data.height,
          mt: cloneDeep(sel.graphShape.data.mt)
        }
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

  clearSelect() {
    this.selectedIds = []
  }

  private renderSelected() {
    const sel = this.selectedGraphs[0]

    if (!sel) {
      this.wbEditor.selectLayer.selectToolGroup.removeAllChildren()
      return
    }

    const { tlCoord, trCoord, brCoord, blCoord, outerBboxCoordSys } = this.selectBox

    const selFrame = new Line({
      id: Graph_Id.graph_ctrl_translate,
      points: [tlCoord.x, tlCoord.y, trCoord.x, trCoord.y, brCoord.x, brCoord.y, blCoord.x, blCoord.y],
      closed: true,
      fillStyle: 'transparent',
      strokeStyle: primaryColor,
      lineWidth: 2
    })

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
      extraData: { transformOrigin: TransformOrigin.tr }
    })
    const blText = new Text({
      x: blCoord.x,
      y: blCoord.y,
      content: '4',
      pointerEvents: 'none',
      mt: scaleHandleMt
    })

    const cloned = this.clonedGraphToGraphLayer(sel, { lineWidth: 1 })

    const rotateHandleMt = compose(
      translate(-rotateSize / 2, -rotateSize / 2),
      rotate(rad, rotateSize / 2, rotateSize / 2)
    )
    const rcs = Object.keys(outerBboxCoordSys).map(item => {
      const val = outerBboxCoordSys[item]
      const rotateCircle = new Rect({
        id: Graph_Id.graph_ctrl_rotate,
        x: val.x,
        y: val.y,
        width: rotateSize,
        height: rotateSize,
        fillStyle: 'white',
        strokeStyle: primaryColor,
        mt: rotateHandleMt
      })

      return rotateCircle
    })

    const outerCenter = {
      x: (outerBboxCoordSys.tl.x + outerBboxCoordSys.tr.x) / 2,
      y: (outerBboxCoordSys.tl.y + outerBboxCoordSys.tr.y) / 2
    }

    const rotateCircle = new Circle({
      id: Graph_Id.graph_ctrl_rotate,
      x: outerCenter.x,
      y: outerCenter.y,
      radius: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor
    })

    const g = new Group({ name: 'ctrl-box' })
    g.append([cloned, selFrame, tlRect, trRect, brRect, blRect, tlText, trText, brText, blText, ...rcs, rotateCircle])

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

const calcRotateRad = (mt: Matrix) => {
  const p = { x: 1, y: 0 }
  const cmt = cloneDeep(mt)
  cmt.e = 0
  cmt.f = 0
  const tp = applyToPoint(cmt, p)
  const rad = Math.atan2(tp.y, tp.x)

  return rad
}

// 来自豆包: https://www.doubao.com/thread/w70e0790decf21329
function calculatePerpendicularPoint(pointA, pointB, fixedDistance) {
  // 计算中点C的坐标
  const midpointC = { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 }

  // 计算AB的向量
  const vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y }

  // 计算垂线的方向向量（旋转90度）
  const perpendicularVector = { x: -vectorAB.y, y: vectorAB.x }

  // 计算垂线方向向量的长度
  const length = Math.sqrt(
    perpendicularVector.x * perpendicularVector.x + perpendicularVector.y * perpendicularVector.y
  )

  // 归一化垂线方向向量
  const normalizedVector = { x: perpendicularVector.x / length, y: perpendicularVector.y / length }

  // 计算点D的坐标（有两个可能的点，这里取其中一个）
  const pointD = {
    x: midpointC.x + normalizedVector.x * fixedDistance,
    y: midpointC.y + normalizedVector.y * fixedDistance
  }

  return pointD
}
