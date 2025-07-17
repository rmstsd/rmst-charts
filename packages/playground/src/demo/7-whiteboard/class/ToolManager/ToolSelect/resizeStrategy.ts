import { ICoord } from 'rmst-render'
import { TransformOrigin } from '../constant'

export type ResizeStrategyOp = {
  getOrigin: (downRect) => ICoord
  getNewSize: (origin: ICoord, movePos: ICoord, downRect) => { width: number; height: number }
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
