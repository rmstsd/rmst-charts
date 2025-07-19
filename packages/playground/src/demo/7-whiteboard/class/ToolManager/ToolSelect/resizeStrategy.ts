import { ICoord } from 'rmst-render'
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
  changeWidthAndHeight: boolean
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

  const { changeWidthAndHeight = true } = options

  const strategy = resizeStrategy[transformOrigin]
  const origin = strategy.getOrigin(downRect)
  const newSize = strategy.getNewSize(origin, movePos, downRect)

  if (changeWidthAndHeight) {
    const scaleX = Math.sign(newSize.width) || 1 // 如果是 0 取 1
    const scaleY = Math.sign(newSize.height) || 1
    const scaleMt = scale(scaleX, scaleY)
    newSize.width = Math.abs(newSize.width)
    newSize.height = Math.abs(newSize.height)

    let newMt = compose(downRect.mt, scaleMt)

    const oldGlobalPos = applyToPoint(downRect.mt, origin)
    const newOrigin = strategy.getOrigin(newSize)
    const newGlobalPos = applyToPoint(newMt, newOrigin)

    const diffPos = { x: newGlobalPos.x - oldGlobalPos.x, y: newGlobalPos.y - oldGlobalPos.y }
    const fixPos = translate(-diffPos.x, -diffPos.y)

    newMt = compose(fixPos, newMt)

    return {
      width: newSize.width,
      height: newSize.height,
      mt: newMt
    }
  } else {
    const sx = newSize.width / downRect.width
    const sy = newSize.height / downRect.height

    const scaleTransform = scale(sx, sy)

    const transformRect = { mt: compose(downRect.mt, scaleTransform) }

    const oldGlobalPos = applyToPoint(downRect.mt, origin)
    const newOrigin = strategy.getOrigin(downRect) // 缩放多个时, 改变的是矩阵, 缩放中心要基于原 rect 的宽高来求
    const newGlobalPos = applyToPoint(transformRect.mt, newOrigin)
    const diffPos = { x: newGlobalPos.x - oldGlobalPos.x, y: newGlobalPos.y - oldGlobalPos.y }
    const fixPos = translate(-diffPos.x, -diffPos.y)
    transformRect.mt = compose(fixPos, transformRect.mt)

    return {
      width: downRect.width,
      height: downRect.height,
      mt: transformRect.mt
    }
  }
}
