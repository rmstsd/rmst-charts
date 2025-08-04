import { ICoord, ITransFormRect } from 'rmst-render'
import { TransformOrigin } from '../constant'
import { applyToPoint, compose, Matrix, scale, translate } from 'transformation-matrix'

export type ResizeStrategyOp = {
  getOrigin: (downRect) => ICoord
  getNewSize: (origin: ICoord, movePos: ICoord, downRect: TransformRect) => { width: number; height: number }
}

type ResizeStrategy = Record<TransformOrigin, ResizeStrategyOp>

export const resizeStrategy: ResizeStrategy = {
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

export interface TransformRect {
  width: number
  height: number
  mt: Matrix
}
interface ResizeRectOptions {
  changeWidthAndHeight?: boolean
  keepRatio?: boolean
}

export const resizeRect = (
  transformOrigin: TransformOrigin,
  movePos: ICoord,
  downRect: TransformRect,
  options?: ResizeRectOptions
) => {
  if (!options) {
    options = {} as ResizeRectOptions
  }

  const { changeWidthAndHeight = true, keepRatio = false } = options

  const strategy = resizeStrategy[transformOrigin]
  const origin = strategy.getOrigin(downRect)
  const newSize = strategy.getNewSize(origin, movePos, downRect)

  if (keepRatio) {
    const maxSize = Math.max(Math.abs(newSize.width), Math.abs(newSize.height))
    newSize.width = (Math.sign(newSize.width) || 1) * maxSize
    newSize.height = (Math.sign(newSize.height) || 1) * maxSize
  }

  const oldGlobalPos = applyToPoint(downRect.mt, origin)

  let newGlobalPos: ICoord
  let transformRect: ITransFormRect = { width: 0, height: 0, mt: downRect.mt }

  if (changeWidthAndHeight) {
    const scaleX = Math.sign(newSize.width) || 1 // 如果是 0 取 1
    const scaleY = Math.sign(newSize.height) || 1
    const scaleMt = scale(scaleX, scaleY)
    newSize.width = Math.abs(newSize.width)
    newSize.height = Math.abs(newSize.height)

    const newMt = compose(downRect.mt, scaleMt)

    const newOrigin = strategy.getOrigin(newSize)
    newGlobalPos = applyToPoint(newMt, newOrigin)

    transformRect = { width: newSize.width, height: newSize.height, mt: newMt }
  } else {
    const sx = newSize.width / downRect.width
    const sy = newSize.height / downRect.height
    const scaleMt = scale(sx, sy)
    transformRect = { width: downRect.width, height: downRect.height, mt: compose(downRect.mt, scaleMt) }

    const newOrigin = origin // 缩放多个时, 改变的是矩阵, 缩放中心要基于原 rect 的宽高来求
    newGlobalPos = applyToPoint(transformRect.mt, newOrigin)
  }

  const diffPos = { x: newGlobalPos.x - oldGlobalPos.x, y: newGlobalPos.y - oldGlobalPos.y }
  const fixPos = translate(-diffPos.x, -diffPos.y)
  transformRect.mt = compose(fixPos, transformRect.mt)

  return transformRect
}
