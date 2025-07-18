import WhiteboardEditor from '../whiteboardEditor'
import { cloneDeep, pull } from 'es-toolkit'
import { applyToPoint, compose, identity, rotate, translate } from 'transformation-matrix'
import { calcMidPoint, distanceTowPoint, Group, Line, mergeBox, Rect, Text } from 'rmst-render'
import svgPath from 'svgpath'
import { IGraph } from '../type'
import { calcRotateRad, Graph_Id } from '../constant'
import { primaryColor } from '../color'
import { TransformOrigin } from './ToolManager/constant'
import EventEmitter from 'rmst-render/event_emitter'
import colorAlpha from 'color-alpha'
import { CursorType } from './cursorManager'

let debugHandle = true

const ctrlSize = 10
const rotateSize = ctrlSize * 1.5

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

      return {
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
      downRect: { width: maxX - minX, height: maxY - minY, mt: translate(minX, minY) }
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

    const rotateHandleMt = compose(
      translate(-rotateSize / 2, -rotateSize / 2),
      rotate(rad, rotateSize / 2, rotateSize / 2)
    )

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
      extraData: { transformOrigin: TransformOrigin.Bottom, cursorType: CursorType.scale_top }
    })
    const right = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(trCoord, brCoord),
      width: hh,
      height: height,
      fillStyle: 'orange',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-hh / 2, -height / 2), rotate(rad, hh / 2, height / 2)),
      extraData: { transformOrigin: TransformOrigin.Left, cursorType: CursorType.scale_right }
    })
    const bottom = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(blCoord, brCoord),
      width: width,
      height: hh,
      fillStyle: 'red',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-width / 2, -hh / 2), rotate(rad, width / 2, hh / 2)),
      extraData: { transformOrigin: TransformOrigin.Top, cursorType: CursorType.scale_top }
    })
    const left = new Rect({
      id: Graph_Id.graph_ctrl_scale,
      ...calcMidPoint(tlCoord, blCoord),
      width: hh,
      height: height,
      fillStyle: 'purple',
      opacity: debugHandle ? 0.5 : 0,
      mt: compose(translate(-hh / 2, -height / 2), rotate(rad, hh / 2, height / 2)),
      extraData: { transformOrigin: TransformOrigin.Right, cursorType: CursorType.scale_right }
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
      const clonedOutline = this.getOutlineGraphInWorld(this.hovered)

      hoveredGroup.removeAllChildren()
      hoveredGroup.append(clonedOutline)
    }
  }

  private getOutlineGraphInWorld(graph: IGraph, attrs = {}) {
    const { wbEditor } = this

    const cloned = graph.graphShape.getOutLineShape()

    const mtWorld = compose(wbEditor.graphLayer.data.mt, cloned.data.mt)
    const nd = svgPath(cloned.data.d)
      .matrix([mtWorld.a, mtWorld.b, mtWorld.c, mtWorld.d, mtWorld.e, mtWorld.f])
      .toString()

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
