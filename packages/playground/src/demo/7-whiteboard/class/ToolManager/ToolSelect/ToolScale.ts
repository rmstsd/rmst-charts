import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'

import { applyToPoint, compose, inverse, scale, translate } from 'transformation-matrix'
import { cloneDeep, keyBy } from 'es-toolkit'
import { ICoord } from 'rmst-render'
import { TransformOrigin } from '../constant'

type StrategyOp = {
  getOrigin: (downRect) => ICoord
  getNewSize: (origin: ICoord, movePos: ICoord, downRect) => { width: number; height: number }
}

type Strategy = Record<TransformOrigin, StrategyOp>

const strategy: Strategy = {
  [TransformOrigin.tl]: {
    getOrigin: downRect => ({ x: 0, y: 0 }),
    getNewSize: (origin: ICoord, movePos: ICoord) => ({ width: movePos.x - origin.x, height: movePos.y - origin.y })
  },
  [TransformOrigin.tr]: {
    getOrigin: downRect => ({ x: downRect.width, y: 0 }),
    getNewSize: (origin: ICoord, movePos: ICoord) => ({ width: origin.x - movePos.x, height: movePos.y - origin.y })
  },
  [TransformOrigin.br]: {
    getOrigin: downRect => ({ x: downRect.width, y: downRect.height }),
    getNewSize: (origin: ICoord, movePos: ICoord) => ({ width: origin.x - movePos.x, height: origin.y - movePos.y })
  },
  [TransformOrigin.bl]: {
    getOrigin: downRect => ({ x: 0, y: downRect.height }),
    getNewSize: (origin: ICoord, movePos: ICoord) => ({ width: movePos.x - origin.x, height: origin.y - movePos.y })
  },
  [TransformOrigin.Top]: {
    getOrigin: downRect => ({ x: downRect.width / 2, y: 0 }),
    getNewSize: (origin: ICoord, movePos: ICoord, downRect) => ({ width: downRect.width, height: movePos.y - origin.y })
  },
  [TransformOrigin.Right]: {
    getOrigin: downRect => ({ x: downRect.width, y: downRect.height / 2 }),
    getNewSize: (origin: ICoord, movePos: ICoord, downRect) => ({
      width: origin.x - movePos.x,
      height: downRect.height
    })
  },
  [TransformOrigin.Bottom]: {
    getOrigin: downRect => ({ x: downRect.width / 2, y: downRect.height }),
    getNewSize: (origin: ICoord, movePos: ICoord, downRect) => ({
      width: downRect.width,
      height: origin.y - movePos.y
    })
  },
  [TransformOrigin.Left]: {
    getOrigin: downRect => ({ x: 0, y: downRect.height / 2 }),
    getNewSize: (origin: ICoord, movePos: ICoord, downRect) => ({
      width: movePos.x - origin.x,
      height: downRect.height
    })
  }
}

export default class ToolScale implements ITool {
  constructor(private wbEditor: WhiteboardEditor, private transformOrigin: TransformOrigin) {
    console.log(transformOrigin)

    if (!transformOrigin) {
      throw new Error('transformOrigin is required')
    }
  }

  origin: ICoord
  startRad: number
  downSnap

  downRect

  strategy: StrategyOp

  onDragStart(downEvt: PointerEvent) {
    console.log('ToolScale onDragStart')

    const { downRect } = this.wbEditor.selectManager.transformDownRect

    this.downRect = downRect

    this.strategy = strategy[this.transformOrigin]
    this.origin = this.strategy.getOrigin(downRect)

    const sel = this.wbEditor.selectManager.selectedGraphs.map(item => ({
      id: item.id,
      graphShapeRect: { mt: cloneDeep(item.graphShape.data.mt) }
    }))

    this.downSnap = keyBy(sel, item => item.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    // console.log('ToolScale onDragMove')

    const movePos = applyToPoint(inverse(this.downRect.mt), sceneCoord)

    const newSize = this.strategy.getNewSize(this.origin, movePos, this.downRect)

    const scaleX = Math.sign(newSize.width) || 1 // 如果是 0 取 1
    const scaleY = Math.sign(newSize.height) || 1
    const scaleMt = scale(scaleX, scaleY)

    newSize.width = Math.abs(newSize.width)
    newSize.height = Math.abs(newSize.height)

    const newOrigin = this.strategy.getOrigin(newSize)

    this.wbEditor.selectManager.selectedGraphs.forEach(item => {
      const dSnap = this.downSnap[item.id].graphShapeRect

      const newMt = compose(dSnap.mt, scaleMt)

      const oldGlobalPos = applyToPoint(this.downRect.mt, this.origin)
      const newGlobalPos = applyToPoint(newMt, newOrigin)

      const diffPos = { x: newGlobalPos.x - oldGlobalPos.x, y: newGlobalPos.y - oldGlobalPos.y }

      const fixPos = translate(-diffPos.x, -diffPos.y)

      item.graphShape.attr({
        width: newSize.width,
        height: newSize.height,
        mt: compose(fixPos, newMt)
      })
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    console.log('ToolScale onDragEnd')
  }
}
