import WhiteboardEditor from '../whiteboardEditor'
import { cloneDeep, noop, pull } from 'es-toolkit'
import { applyToPoint, compose, identity, rotate, translate } from 'transformation-matrix'
import {
  distanceTowPoint,
  Group,
  ICoord,
  IShape,
  ITransFormRect,
  Line,
  mergeBox,
  Path,
  pointToFlatArray,
  Rect,
  Text
} from 'rmst-render'
import svgPath from 'svgpath'
import { calcRotateRad, Graph_Id } from '../constant'
import { primaryColor } from '../color'
import { TransformOrigin } from './ToolManager/constant'
import colorAlpha from 'color-alpha'
import { CursorType } from './cursorManager'
import { ToolEnum } from './ToolManager/constant'
import ToolSelect from './ToolManager/ToolSelect/ToolSelect'

let debugHandle = false

const ctrlSize = 8
const rotateSize = ctrlSize * 1.5

interface Events {
  // selectedChange: (selectedGraphs: IGraph[]) => void // 选中变化事件, 以及选中的元素的数据变化
}

export default class selectedManager {
  constructor(private wbEditor: WhiteboardEditor) {}

  // eventEmitter = new EventEmitter<Events>()

  private hovered: IShape
  private enabledHover = true

  selectedIds: string[] = []

  unbind = noop

  get selectedGraphs() {
    return this.wbEditor.graphLayer.children.filter(g => this.selectedIds.includes(g.id))
  }

  get transformRect(): ITransFormRect {
    if (this.selectedIds.length === 1) {
      const shapeData = this.selectedGraphs[0].data
      return { width: shapeData.width, height: shapeData.height, mt: cloneDeep(shapeData.mt) }
    }

    // 多个
    const selRects = this.selectedGraphs.map(item => {
      const data = item.data
      const tl = applyToPoint(data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(data.mt, { x: data.width, y: 0 })
      const br = applyToPoint(data.mt, { x: data.width, y: data.height })
      const bl = applyToPoint(data.mt, { x: 0, y: data.height })
      return { tl, tr, br, bl }
    })

    const { minX, minY, maxX, maxY } = mergeBox(selRects)
    return { width: maxX - minX, height: maxY - minY, mt: translate(minX, minY) }
  }

  bindEvent() {
    const { wbEditor } = this

    const off_1 = wbEditor.camera.eventEmitter.on('cameraChange', () => {
      this.renderSelected()
      this.renderHovered()
    })

    const off_2 = wbEditor.eventEmitter.on('render', () => {
      this.renderSelected()
      this.renderHovered()
    })

    this.unbind = () => {
      off_1()
      off_2()
    }
  }

  dispose() {
    this.unbind()
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

  hideCtrlBox() {
    this.wbEditor.ctrlBoxLayer.attr({ visible: false })
  }

  showCtrlBox() {
    this.wbEditor.ctrlBoxLayer.attr({ visible: true })
  }

  private renderSelected() {
    if (!this.selectedIds.length) {
      this.wbEditor.ctrlBoxLayer.removeAllChildren()
      return
    }

    const downRect = this.transformRect

    const tl = { x: 0, y: 0 }
    const tr = { x: downRect.width, y: 0 }
    const br = { x: downRect.width, y: downRect.height }
    const bl = { x: 0, y: downRect.height }

    const mtWorld = compose(this.wbEditor.graphLayer.data.mt, downRect.mt)

    const tlCoord = applyToPoint(mtWorld, tl)
    const trCoord = applyToPoint(mtWorld, tr)
    const brCoord = applyToPoint(mtWorld, br)
    const blCoord = applyToPoint(mtWorld, bl)

    const widthWorld = distanceTowPoint(tlCoord, trCoord)
    const heightWorld = distanceTowPoint(tlCoord, blCoord)

    const padding = ctrlSize / this.wbEditor.camera.zoom
    const outerBbox = {
      x: -padding,
      y: -padding,
      width: downRect.width + padding * 2,
      height: downRect.height + padding * 2
    }

    // tl tr br bl
    const outerBboxWorld = [
      {
        coord: applyToPoint(mtWorld, { x: outerBbox.x, y: outerBbox.y }),
        cursorType: CursorType.rotate_tl
      },
      {
        coord: applyToPoint(mtWorld, { x: outerBbox.x + outerBbox.width, y: outerBbox.y }),
        cursorType: CursorType.rotate_tr
      },
      {
        coord: applyToPoint(mtWorld, { x: outerBbox.x + outerBbox.width, y: outerBbox.y + outerBbox.height }),
        cursorType: CursorType.rotate_br
      },
      {
        coord: applyToPoint(mtWorld, { x: outerBbox.x, y: outerBbox.y + outerBbox.height }),
        cursorType: CursorType.rotate_bl
      }
    ]

    const selFrame = new Line({
      id: Graph_Id.graph_ctrl_translate,
      points: [tlCoord.x, tlCoord.y, trCoord.x, trCoord.y, brCoord.x, brCoord.y, blCoord.x, blCoord.y],
      closed: true,
      fillStyle: 'transparent',
      strokeStyle: primaryColor,
      lineWidth: 1
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
      visible: widthWorld > rotateSize && heightWorld > rotateSize,
      extraData: { transformOrigin: TransformOrigin.br, cursorType: CursorType.scale_br }
    })
    const tlText = new Text({
      x: tlCoord.x,
      y: tlCoord.y,
      content: '1',
      pointerEvents: 'none',
      mt: scaleHandleMt,
      opacity: debugHandle ? 0.5 : 0
    })
    const trRect = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      x: trCoord.x,
      y: trCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      visible: heightWorld > rotateSize,
      mt: scaleHandleMt,
      extraData: { transformOrigin: TransformOrigin.bl, cursorType: CursorType.scale_tr }
    })
    const trText = new Text({
      x: trCoord.x,
      y: trCoord.y,
      content: '2',
      pointerEvents: 'none',
      mt: scaleHandleMt,
      opacity: debugHandle ? 0.5 : 0
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
      extraData: { transformOrigin: TransformOrigin.tl, cursorType: CursorType.scale_br }
    })
    const brText = new Text({
      x: brCoord.x,
      y: brCoord.y,
      content: '3',
      pointerEvents: 'none',
      mt: scaleHandleMt,
      opacity: debugHandle ? 0.5 : 0
    })
    const blRect = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      x: blCoord.x,
      y: blCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      visible: widthWorld > rotateSize,
      mt: scaleHandleMt,
      extraData: { transformOrigin: TransformOrigin.tr, cursorType: CursorType.scale_tr }
    })
    const blText = new Text({
      x: blCoord.x,
      y: blCoord.y,
      content: '4',
      pointerEvents: 'none',
      mt: scaleHandleMt,
      opacity: debugHandle ? 0.5 : 0
    })

    const clonedOutlines = this.selectedGraphs.map(item => this.getOutlineGraphInWorld(item, { lineWidth: 1 }))

    const rotateHandleMt = compose(translate(-rotateSize / 2, -rotateSize / 2), rotate(rad, rotateSize / 2, rotateSize / 2))

    const rotateHandles = outerBboxWorld.map(item => {
      return new Rect({
        id: Graph_Id.graph_ctrl_rotate,
        x: item.coord.x,
        y: item.coord.y,
        width: rotateSize,
        height: rotateSize,
        fillStyle: colorAlpha('white', 0.5),
        strokeStyle: primaryColor,
        opacity: debugHandle ? 0.5 : 0,
        mt: rotateHandleMt,
        extraData: { cursorType: item.cursorType }
      })
    })

    const top = new Line({
      id: Graph_Id.graph_ctrl_scale,
      points: pointToFlatArray(calculateRectangleVertices(tlCoord, trCoord, ctrlSize)),
      closed: true,
      fillStyle: 'pink',
      opacity: debugHandle ? 0.5 : 0,
      extraData: { transformOrigin: TransformOrigin.Bottom, cursorType: CursorType.scale_top }
    })

    const right = new Line({
      id: Graph_Id.graph_ctrl_scale,
      points: pointToFlatArray(calculateRectangleVertices(trCoord, brCoord, ctrlSize)),
      closed: true,
      fillStyle: 'orange',
      opacity: debugHandle ? 0.5 : 0,
      extraData: { transformOrigin: TransformOrigin.Left, cursorType: CursorType.scale_right }
    })
    const bottom = new Line({
      id: Graph_Id.graph_ctrl_scale,
      points: pointToFlatArray(calculateRectangleVertices(blCoord, brCoord, ctrlSize)),
      closed: true,
      fillStyle: 'red',
      opacity: debugHandle ? 0.5 : 0,
      extraData: { transformOrigin: TransformOrigin.Top, cursorType: CursorType.scale_top }
    })
    const left = new Line({
      id: Graph_Id.graph_ctrl_scale,
      points: pointToFlatArray(calculateRectangleVertices(tlCoord, blCoord, ctrlSize)),
      closed: true,
      fillStyle: 'purple',
      opacity: debugHandle ? 0.5 : 0,
      extraData: { transformOrigin: TransformOrigin.Right, cursorType: CursorType.scale_right }
    })

    let customHandles = []

    if (this.customHandleVisible && this.selectedGraphs.length === 1) {
      const selectedGraph = this.selectedGraphs[0]
      const wbType = selectedGraph.data.extraData?.wbType

      if (wbType) {
        // 由于 ToolCustomHandle 只会在选择工具中被使用，所以从 ToolSelect 中获取
        const toolSelect = this.wbEditor.toolManager.getCurrentToolClass(ToolEnum.Select) as ToolSelect
        const provider = toolSelect?.toolCustomHandle?.getProvider(wbType)
        if (provider) {
          const handles = provider.renderHandles(this.wbEditor, selectedGraph)
          customHandles.push(...handles)
        }
      }
    }

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
      blText,

      ...customHandles
    ])

    this.wbEditor.ctrlBoxLayer.removeAllChildren()
    this.wbEditor.ctrlBoxLayer.append(g)
  }

  private customHandleVisible = true
  setCustomHandleVisible(visible: boolean) {
    this.customHandleVisible = visible
    this.renderSelected()
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
      this.hovered = wbEditor.graphLayer.children.find(g => g.id === id)
    } else {
      this.hovered = null
    }

    this.renderHovered()
  }

  clearHover() {
    this.onHover(null, false)
  }

  renderHovered() {
    const { hoveredLayer } = this.wbEditor
    hoveredLayer.removeAllChildren()

    if (this.hovered) {
      const clonedOutline = this.getOutlineGraphInWorld(this.hovered)

      hoveredLayer.removeAllChildren()
      hoveredLayer.append(clonedOutline)
    }
  }

  private getOutlineGraphInWorld(graph: IShape, attrs = {}) {
    const { wbEditor } = this

    const cloned = graph.getOutLineShape() as Path

    const mtWorld = compose(wbEditor.graphLayer.data.mt, cloned.data.mt)
    const nd = svgPath(cloned.data.d).matrix([mtWorld.a, mtWorld.b, mtWorld.c, mtWorld.d, mtWorld.e, mtWorld.f]).toString()

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

// https://www.doubao.com/chat/12714978760467970
function calculateRectangleVertices(midPoint1: ICoord, midPoint2: ICoord, height: number) {
  // 计算两点之间的距离，作为矩形的一条边长
  const length = Math.sqrt(Math.pow(midPoint2.x - midPoint1.x, 2) + Math.pow(midPoint2.y - midPoint1.y, 2))

  // 计算从 midPoint1 到 midPoint2 的方向向量
  const dx = midPoint2.x - midPoint1.x
  const dy = midPoint2.y - midPoint1.y

  // 计算方向向量的单位向量
  const magnitude = Math.sqrt(dx * dx + dy * dy)
  const unitX = dx / magnitude
  const unitY = dy / magnitude

  // 计算垂直于方向向量的单位向量（旋转90度）
  const perpendicularUnitX = -unitY
  const perpendicularUnitY = unitX

  // 矩形的宽度可以任意设定，这里假设宽度是长度的一半
  const width = length / 2
  const halfWidth = height / 2

  // 计算四个顶点的坐标
  const vertex1 = {
    x: midPoint1.x + halfWidth * perpendicularUnitX,
    y: midPoint1.y + halfWidth * perpendicularUnitY
  }

  const vertex2 = {
    x: midPoint1.x - halfWidth * perpendicularUnitX,
    y: midPoint1.y - halfWidth * perpendicularUnitY
  }

  const vertex3 = {
    x: midPoint2.x - halfWidth * perpendicularUnitX,
    y: midPoint2.y - halfWidth * perpendicularUnitY
  }

  const vertex4 = {
    x: midPoint2.x + halfWidth * perpendicularUnitX,
    y: midPoint2.y + halfWidth * perpendicularUnitY
  }

  return [vertex1, vertex2, vertex3, vertex4]
}
