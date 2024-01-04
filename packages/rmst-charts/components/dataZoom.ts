import { ChartRoot } from 'rmst-charts/ChartRoot'
import { BoxHidden, Group, Line, Rect } from 'rmst-render'

const moveHandleHeight = 6

const sideHandleSize = { width: 6, height: 20, cornerRadius: 1 } as Rect['data']
const sideHandleHalfWidth = sideHandleSize.width / 2

const initialColor = 'rgb(210, 219, 238)'
const activeColor = 'rgb(143, 176, 257)'

export interface RangeRatio {
  startRatio: number // 0.13
  endRatio: number // o.44
}

export default class dataZoom {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr

    if (!hasDataZoom(this.cr.userOption)) {
      return
    }

    const [slider] = this.cr.userOption.dataZoom

    const { start, end } = slider // 50% 70%

    this.rangeRatio.startRatio = start / 100
    this.rangeRatio.endRatio = end / 100
  }

  elements = []

  private start_x = 0
  private end_x = 0

  rangeRatio: RangeRatio = { startRatio: 0, endRatio: 100 }

  render() {
    if (!hasDataZoom(this.cr.userOption)) {
      return
    }

    const xAxis = this.cr.coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData.axis

    const backGround = new Rect({
      x: xAxis.start.x,
      y: xAxis.start.y + 50,
      width: xAxis.end.x - xAxis.start.x,
      height: 30,
      cornerRadius: 2,
      fillStyle: '#fff',
      strokeStyle: '#d2dbee'
    })

    this.start_x = backGround.data.x + backGround.data.width * this.rangeRatio.startRatio
    this.end_x = backGround.data.x + backGround.data.width * this.rangeRatio.endRatio

    // -------------------------------

    const control_lt = { y: backGround.data.y }
    const control_rb = { y: control_lt.y + backGround.data.height }

    const controlWidth = () => this.end_x - this.start_x

    const calcLeftBgLinePoints = () => ({ points: [this.start_x, control_lt.y, this.start_x, control_rb.y] })
    const handleLeftBgLine = new Line({
      ...calcLeftBgLinePoints(),
      lineWidth: 1,
      fillStyle: initialColor,
      cursor: 'w-resize',
      draggable: 'horizontal'
    })

    const calcRightBgLinePoints = () => ({ points: [this.end_x, control_lt.y, this.end_x, control_rb.y] })
    const handleRightBgLine = new Line({
      ...calcRightBgLinePoints(),
      lineWidth: 1,
      fillStyle: 'rgb(172,184,209)',
      cursor: 'w-resize',
      draggable: 'horizontal'
    })

    const moveControlGroup = new Group({})

    const calcInsideRect = () => ({
      x: this.start_x,
      y: control_lt.y,
      width: controlWidth(),
      height: backGround.data.height
    })

    const insideRect = new Rect({ ...calcInsideRect(), fillStyle: 'rgb(135,175,255)', opacity: 0.2 })

    const calcMoveHandle = () => ({
      x: this.start_x,
      y: control_lt.y - moveHandleHeight,
      width: this.end_x - this.start_x,
      height: moveHandleHeight
    })

    const moveHandle = new BoxHidden({
      ...calcMoveHandle(),
      fillStyle: 'rgb(210,219,238)',
      opacity: 0.7,
      cursor: 'w-resize',
      draggable: 'horizontal'
    })

    wrapDragRange_x(
      moveHandle,
      backGround.data.x,
      () => backGround.data.x + backGround.data.width - controlWidth(),
      () => {
        const _x = moveHandle.data.x

        this.start_x = _x
        this.end_x = _x + moveHandle.data.width

        updateControl()

        this.onRange(calcRange())
      }
    )

    const calcRange = () => {
      const startRatio = (moveHandle.data.x - backGround.data.x) / backGround.data.width
      const endRatio = (moveHandle.data.x + moveHandle.data.width - backGround.data.x) / backGround.data.width

      const ans = { startRatio: Math.min(startRatio, endRatio), endRatio: Math.max(startRatio, endRatio) }

      this.rangeRatio = ans

      return ans
    }

    const calcLeft = () => ({
      x: this.start_x - sideHandleHalfWidth,
      y: control_lt.y + (backGround.data.height - sideHandleSize.height) / 2
    })

    const handleLeft = new Rect({
      ...calcLeft(),
      ...sideHandleSize,
      fillStyle: '#fff',
      strokeStyle: 'rgb(172,184,209)',
      cursor: 'w-resize',
      draggable: 'horizontal'
    })

    wrapDragRange_x(
      handleLeft,
      backGround.data.x - sideHandleHalfWidth,
      backGround.data.x + backGround.data.width - sideHandleHalfWidth,
      () => {
        this.start_x = handleLeft.data.x + sideHandleHalfWidth

        updateControl()

        this.onRange(calcRange())
      }
    )

    const calcRight = () => ({
      x: this.end_x - sideHandleSize.width / 2,
      y: control_lt.y + (backGround.data.height - sideHandleSize.height) / 2
    })
    const handleRight = new Rect({
      ...calcRight(),
      ...sideHandleSize,
      fillStyle: '#fff',
      strokeStyle: 'rgb(172,184,209)',
      cursor: 'w-resize',
      draggable: 'horizontal'
    })

    wrapDragRange_x(
      handleRight,
      backGround.data.x - sideHandleHalfWidth,
      backGround.data.x + backGround.data.width - sideHandleHalfWidth,
      () => {
        this.end_x = handleRight.data.x + sideHandleHalfWidth

        updateControl()

        this.onRange(calcRange())
      }
    )

    const rect_width = 1.2
    const rect_height = moveHandle.data.height - 2
    const rect_y = moveHandle.data.y + moveHandle.data.height / 2 - rect_height / 2

    const rectCfg = { y: rect_y, width: rect_width, height: rect_height, fillStyle: '#fff' }

    const calcRectCenter = () => {
      return { x: this.start_x + moveHandle.data.width / 2 }
    }
    function calcRectLeft() {
      return { x: rect_center.data.x - rect_width - 2 }
    }
    function calcRectRight() {
      return { x: rect_center.data.x + rect_width + 2 }
    }

    const rect_center = new Rect({ ...calcRectCenter(), ...rectCfg })
    const rect_left = new Rect({ ...calcRectLeft(), ...rectCfg })
    const rect_right = new Rect({ ...calcRectRight(), ...rectCfg })

    moveHandle.append(rect_center, rect_left, rect_right)

    moveControlGroup.append(insideRect, handleLeftBgLine, handleRightBgLine, handleLeft, handleRight, moveHandle)

    const updateControl = () => {
      moveHandle.attr(calcMoveHandle())
      insideRect.attr(calcInsideRect())

      handleLeft.attr(calcLeft())
      handleRight.attr(calcRight())

      handleLeftBgLine.attr(calcLeftBgLinePoints())
      handleRightBgLine.attr(calcRightBgLinePoints())

      rect_center.attr(calcRectCenter())
      rect_left.attr(calcRectLeft())
      rect_right.attr(calcRectRight())
    }
    const controlActive = () => {
      moveHandle.animateCartoon({ fillStyle: activeColor }, { duration: 300 })
    }
    const controlUnActive = () => {
      moveHandle.animateCartoon({ fillStyle: initialColor }, { duration: 300 })
    }

    moveHandle.onmouseenter = controlActive
    moveHandle.onmouseleave = controlUnActive

    handleLeft.onmouseenter = controlActive
    handleLeft.onmouseleave = controlUnActive

    handleRight.onmouseenter = controlActive
    handleRight.onmouseleave = controlUnActive

    this.elements.push(backGround, moveControlGroup)

    return this.elements
  }

  onRange(rangeRatio: RangeRatio) {}
}

export const hasDataZoom = option => {
  return Boolean(option?.dataZoom)
}

interface BoundaryRange {
  min: number
  max: number
}
function boundary(value: number, value_range: BoundaryRange) {
  if (value < value_range.min) {
    value = value_range.min
  }

  if (value > value_range.max) {
    value = value_range.max
  }

  return value
}

function wrapDragRange_x(shape: IShape, min: number, max: number | Function, ondrag) {
  let x_offset

  shape.ondragstart = evt => {
    x_offset = evt.x - shape.data.x
  }

  shape.ondrag = evt => {
    const _x = boundary(evt.x - x_offset, { min, max: typeof max === 'function' ? max() : max })

    shape.attr({ x: _x })

    ondrag(evt)
  }
}
