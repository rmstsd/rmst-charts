import type * as CSS from 'csstype'
import WhiteboardEditor from '../whiteboardEditor'
import { calcRotateRad, isFlipped, normalizeAngle } from '../constant'
import { rad2deg } from 'rmst-render'
import { range } from 'es-toolkit'

import selectCursorSvg from './icon/cursor.svg?raw'

const getScaleSvg = (rotateDeg: number) => {
  return `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id='shadow' y='-40%' x='-40%' width='180px' height='180%' color-interpolation-filters='sRGB'>
          <feDropShadow dx='1' dy='-0.9999999999999999' stdDeviation='1.2' flood-opacity='.5' />
        </filter>
      </defs>

      <g fill='none' transform='rotate(${rotateDeg} 16 16)' filter='url(#shadow)'>
        <path
          d="M16.001 3H15.996L10 12.747L13.999 12.7486V15.9976L13.999 19.2807H9.999L16 29L21.999 19.2807L17.98 19.2823L17.978 15.9976V12.747L22 12.7486L16.001 3ZM15.998 5.29331L19.586 11.1233L16.999 11.1216V16.8102V20.9076H19.584L15.998 26.7018L12.413 20.9092L14.998 20.9076V16.8102L14.999 11.1233L12.413 11.1216L15.998 5.29331Z"
          fill="white" />
        <path
          d="M14.9985 16.8104V20.9078H12.4125L15.9985 26.702L19.5835 20.9078H16.9785V16.8104V11.1218H19.5855L15.9985 5.29347L12.4125 11.1218H14.9995L14.9985 16.8104Z"
          fill="black" />
      </g>
    </svg>
  `
}

const getRotationSvg = (rotateDeg: number) => {
  rotateDeg = Math.floor(rotateDeg)

  return `
    <svg height='32' width='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg' style='color: #000000;'>
      <defs>
        <filter id='shadow' y='-40%' x='-40%' width='180px' height='180%' color-interpolation-filters='sRGB'>
          <feDropShadow dx='-0.9644913303165966' dy='-1.034290323721595' stdDeviation='1.2' flood-opacity='.5' />
        </filter>
      </defs>
      <g fill='none' transform='rotate(${rotateDeg} 16 16)' filter='url(#shadow)'>
        <path d='M22.4789 9.45728L25.9935 12.9942L22.4789 16.5283V14.1032C18.126 14.1502 14.6071 17.6737 14.5675
          22.0283H17.05L13.513 25.543L9.97889 22.0283H12.5674C12.6071 16.5691 17.0214 12.1503 22.4789 12.1031L22.4789
          9.45728Z' fill='#000000' />
        <path fill-rule='evenodd' clip-rule='evenodd'
          d='M21.4789 7.03223L27.4035 12.9945L21.4789 18.9521V15.1868C18.4798 15.6549 16.1113 18.0273 15.649 21.0284H19.475L13.5128 26.953L7.55519 21.0284H11.6189C12.1243 15.8155 16.2679 11.6677 21.4789 11.1559L21.4789 7.03223ZM22.4789 12.1031C17.0214 12.1503 12.6071 16.5691 12.5674 22.0284H9.97889L13.513 25.543L17.05 22.0284H14.5675C14.5705 21.6896 14.5947 21.3558 14.6386 21.0284C15.1157 17.4741 17.9266 14.6592 21.4789 14.1761C21.8063 14.1316 22.1401 14.1069 22.4789 14.1032V16.5284L25.9935 12.9942L22.4789 9.45729L22.4789 12.1031Z'
          fill='#ffffff' />
      </g>
    </svg>`
}

// alt 键 复制
export const duplicateCursor =
  '-webkit-image-set(url(data:image/png;base64,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)2x) 4 4, auto'

export enum CursorType {
  scale_top = 'scale_top',
  scale_right = 'scale_right',
  scale_tr = 'scale_tr',
  scale_br = 'scale_br',

  rotate_tl = 'rotate_tl',
  rotate_tr = 'rotate_tr',
  rotate_br = 'rotate_br',
  rotate_bl = 'rotate_bl'
}

type CursorResize = { type: 'resize'; rotation: number } // 角度
type CursorRotation = { type: 'rotation'; rotation: number } // 角度
type CursorSelect = { type: 'select' } // 角度

type ICursorCustom = CursorResize | CursorRotation | CursorSelect

export type WbCursor = CSS.Property.Cursor | ICursorCustom

function getCssCursorValue(url: string) {
  return `url("${url}") 16 16, auto`
}

export default class CursorManager {
  constructor(private wbEditor: WhiteboardEditor) {}

  public setCursor(cursor: WbCursor) {
    const cursorString = typeof cursor === 'string' ? cursor : getCursor_v2(cursor)

    this.wbEditor.stage.canvasElement.style.setProperty('cursor', cursorString)
  }
}

const cursorCached = new Map<string, string>()

{
  genCursor()

  function genCursor() {
    cursorCached.set('select', 'default')

    range(0, 61).forEach(item => {
      const dataAngle = scaleValue(item, 60, 360)
      {
        const key = `rotation-${item}`
        const svgString = getRotationSvg(dataAngle)

        const url = svgToBase64(svgString)
        cursorCached.set(key, getCssCursorValue(url))
      }

      {
        const svgString2 = getScaleSvg(dataAngle)
        const key2 = `resize-${item}`
        const url2 = svgToBase64(svgString2)
        cursorCached.set(key2, getCssCursorValue(url2))
      }
    })
  }
}

function scaleValue(value, oldMax, newMax) {
  return (value / oldMax) * newMax
}

function getCursor_v2(cursor: ICursorCustom) {
  if (cursor.type === 'select') {
    return cursorCached.get(cursor.type)
  }

  const cc = scaleValue(normalizeAngle(cursor.rotation), 360, 60)
  const rotation = Math.round(cc)

  const key = `${cursor.type}-${rotation}`

  if (cursorCached.has(key)) {
    return cursorCached.get(key)
  }

  console.warn('请提前生成')
}

export function getCursorRotation(type: 'resize' | 'rotation', cursorType, mt) {
  if (!cursorType || !mt) {
    console.warn('getRotation cursorType or mt is undefined')
  }

  if (type === 'rotation') {
    const isFlip = isFlipped(mt)
    const data = {
      [CursorType.rotate_tl]: isFlip ? -90 : 0,
      [CursorType.rotate_tr]: isFlip ? 180 : 90,
      [CursorType.rotate_br]: isFlip ? 90 : 180,
      [CursorType.rotate_bl]: isFlip ? 0 : -90
    }
    const shapeROtation = rad2deg(calcRotateRad(mt))
    const ansRotation = data[cursorType] + shapeROtation

    return ansRotation
  }

  if (type === 'resize') {
    const isFlip = isFlipped(mt)
    const data = {
      [CursorType.scale_top]: isFlip ? 0 : 0,
      [CursorType.scale_right]: isFlip ? 90 : 90,
      [CursorType.scale_tr]: isFlip ? -45 : 45,
      [CursorType.scale_br]: isFlip ? 45 : -45
    }
    const shapeRotation = rad2deg(calcRotateRad(mt))
    const ansRotation = data[cursorType] + shapeRotation

    return ansRotation
  }

  console.warn('待实现')
}

function svgToBase64(svgString) {
  // 1. 去除不必要的空白（可选）
  const cleanedSvg = svgString.replace(/\s+/g, ' ').trim()

  // 2. 对 SVG 字符串进行 Base64 编码
  const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)))

  // 3. 添加 data URI 前缀
  return `data:image/svg+xml;base64,${base64}`
}
