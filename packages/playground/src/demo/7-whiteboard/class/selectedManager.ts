import { makeAutoObservable } from 'mobx'
import WhiteboardEditor from '../whiteboardEditor'
import { pull } from 'es-toolkit'
import { applyToPoint, compose, identity, translate } from 'transformation-matrix'
import { Circle, Group, Line, Rect } from 'rmst-render'
import svgPath from 'svgpath'
import { Graph } from '../type'
import { Graph_Id } from '../constant'

export default class selectedManager {
  constructor(private wbEditor: WhiteboardEditor) {
    makeAutoObservable(this)
  }

  private hovered: Graph
  private enabledHover = true

  selectedIds: string[] = []

  get selectedGraphs() {
    return this.wbEditor.graphs.filter(g => this.selectedIds.includes(g.id))
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

    const selFrame = new Line({
      points: [tlCoord.x, tlCoord.y, trCoord.x, trCoord.y, brCoord.x, brCoord.y, blCoord.x, blCoord.y],
      closed: true,
      fillStyle: 'transparent',
      strokeStyle: 'blue',
      lineWidth: 2,
      id: Graph_Id.graph_ctrl_translate
    })

    const ctrlSize = 10

    const tlRect = new Rect({
      x: tlCoord.x,
      y: tlCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: 'blue',
      mt: translate(-ctrlSize / 2, -ctrlSize / 2)
    })
    const trRect = new Rect({
      x: trCoord.x,
      y: trCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: 'blue',
      mt: translate(-ctrlSize / 2, -ctrlSize / 2)
    })
    const brRect = new Rect({
      x: brCoord.x,
      y: brCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: 'blue',
      mt: translate(-ctrlSize / 2, -ctrlSize / 2)
    })
    const blRect = new Rect({
      x: blCoord.x,
      y: blCoord.y,
      width: ctrlSize,
      height: ctrlSize,
      fillStyle: 'white',
      strokeStyle: 'blue',
      mt: translate(-ctrlSize / 2, -ctrlSize / 2)
    })

    const rotateCircle = new Circle({
      x: rotCoord.x,
      y: rotCoord.y,
      radius: ctrlSize / 2,
      fillStyle: 'white',
      strokeStyle: 'blue'
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

  private clonedGraphToGraphLayer(graph: Graph, attrs = {}) {
    const { wbEditor } = this

    const cloned = graph.graphShape.clone()
    const mt = compose(wbEditor.graphLayer.data.mt, cloned.data.mt)
    const nd = svgPath(cloned.data.d).matrix([mt.a, mt.b, mt.c, mt.d, mt.e, mt.f]).toString()

    cloned.attr({
      d: nd,
      mt: identity(),
      fillStyle: null,
      strokeStyle: 'blue',
      lineWidth: 2,
      pointerEvents: 'none',
      ...attrs
    })

    return cloned
  }
}
