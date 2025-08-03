import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint, compose, inverse, rotate, rotateDEG } from 'transformation-matrix'
import { cloneDeep, keyBy, range } from 'es-toolkit'
import { ICoord, rad2deg } from 'rmst-render'
import { CursorType, getCursorRotation } from '../../cursorManager'
import { calcRotateRad } from '@/demo/7-whiteboard/constant'

export default class ToolRotate implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private cursorType: CursorType) {}

  origin: ICoord
  startRad: number
  downSnap
  downRect
  isSingleSelect = false

  startShapeRotation

  movePos: ICoord

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('ToolRotate onDragStart')

    this.downRect = this.wbEditor.selectManager.transformRect
    this.isSingleSelect = this.wbEditor.selectManager.selectedIds.length === 1

    this.origin = applyToPoint(this.downRect.mt, { x: this.downRect.width / 2, y: this.downRect.height / 2 })
    this.startRad = Math.atan2(sceneCoord.y - this.origin.y, sceneCoord.x - this.origin.x)

    this.startShapeRotation = calcRotateRad(this.downRect.mt)

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.id,
      graphShapeRect: { mt: cloneDeep(item.data.mt) }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    // console.log('ToolRotate onDragMove')

    this.movePos = sceneCoord
    this.updateRotation()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolRotate onDragEnd')
  }

  private updateRotation() {
    if (!this.movePos) {
      return
    }

    const { isShiftKeyPressing } = this.wbEditor.keyboard

    const { origin } = this

    const currRad = Math.atan2(this.movePos.y - origin.y, this.movePos.x - origin.x)
    const diffRad = currRad - this.startRad
    let diffMt = rotate(diffRad, origin.x, origin.y)

    if (isShiftKeyPressing) {
      const newMt_2 = compose(diffMt, this.downRect.mt)
      const newDeg = findNearestRotation(rad2deg(calcRotateRad(newMt_2)))
      const newRotationMt = rotateDEG(newDeg, origin.x, origin.y)
      diffMt = compose(newRotationMt, inverse(rotate(this.startShapeRotation, origin.x, origin.y)))
    }

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id].graphShapeRect
      const newMt = compose(diffMt, dSnap.mt)
      item.attr('mt', newMt)
    })

    {
      const mt = compose(diffMt, this.downRect.mt)
      const rotation = getCursorRotation('rotation', this.cursorType, mt)
      this.wbEditor.cursorManager.setCursor({ type: 'rotation', rotation })
    }

    this.wbEditor.triggerRender()
  }

  onShiftToggle(isShiftKeyPressing: boolean) {
    this.updateRotation()
  }
}

function findNearestRotation(randomNum) {
  const targets = range(-180, 180, 15)

  // 初始化最小差值和对应的目标值
  let minDiff = Math.abs(randomNum - targets[0])
  let nearest = targets[0]

  // 遍历所有目标值，找到最接近的
  for (let i = 1; i < targets.length; i++) {
    const diff = Math.abs(randomNum - targets[i])
    if (diff < minDiff) {
      minDiff = diff
      nearest = targets[i]
    }
  }

  return nearest
}
