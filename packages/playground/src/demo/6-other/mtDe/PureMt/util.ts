import { ICoord } from 'rmst-render'
import { Matrix } from 'transformation-matrix'

export interface Rect {
  id?: string
  width: number
  height: number
  mt: Matrix
  fill?: string
  stroke?: string
}

export enum TransformOrigin {
  TopLeft = 'tl',
  TopRight = 'tr',
  BottomRight = 'br',
  BottomLeft = 'bl',

  Top = 'top',
  Right = 'r',
  Bottom = 'b',
  Left = 'l',

  Center = 'center'
}

type Strategy = {
  [key: string]: {
    origin(rect: Rect): ICoord
    getDxDy: (moveLocal: ICoord, downLocal: ICoord) => { dx: number; dy: number }
  }
}

export const strategy: Strategy = {
  [TransformOrigin.TopLeft]: {
    origin: rect => ({ x: 0, y: 0 }),
    getDxDy: (moveLocal, downLocal) => ({ dx: moveLocal.x - downLocal.x, dy: moveLocal.y - downLocal.y })
  },
  [TransformOrigin.TopRight]: {
    origin: rect => ({ x: rect.width, y: 0 }),
    getDxDy: (moveLocal, downLocal) => ({ dx: downLocal.x - moveLocal.x, dy: moveLocal.y - downLocal.y })
  },
  [TransformOrigin.BottomRight]: {
    origin: rect => ({ x: rect.width, y: rect.height }),
    getDxDy: (moveLocal, downLocal) => ({ dx: downLocal.x - moveLocal.x, dy: downLocal.y - moveLocal.y })
  },
  [TransformOrigin.BottomLeft]: {
    origin: rect => ({ x: 0, y: rect.height }),
    getDxDy: (moveLocal, downLocal) => ({ dx: moveLocal.x - downLocal.x, dy: downLocal.y - moveLocal.y })
  }
}
