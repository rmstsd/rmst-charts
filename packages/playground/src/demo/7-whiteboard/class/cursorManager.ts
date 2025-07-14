import type * as CSS from 'csstype'
import WhiteboardEditor from '../whiteboardEditor'
import { calcRotateRad, isFlipped, normalizeAngle } from '../constant'
import { rad2deg } from 'rmst-render'
import { range } from 'es-toolkit'

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

type WbCursor = CSS.Property.Cursor | CursorResize | CursorRotation

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
    range(0, 61).forEach(item => {
      const dataAngle = scaleValue(item, 60, 360)
      {
        const key = `rotation-${item}`
        const svgString = getRotationSvg(dataAngle)

        const url = svgToBase64(svgString)
        const cursorString = `url("${url}") 16 16, auto`
        cursorCached.set(key, cursorString)
      }

      {
        const svgString2 = getScaleSvg(dataAngle)
        const key2 = `resize-${item}`
        const url2 = svgToBase64(svgString2)
        const cursorString2 = `url("${url2}") 16 16, auto`
        cursorCached.set(key2, cursorString2)
      }
    })
  }
}

function scaleValue(value, oldMax, newMax) {
  return (value / oldMax) * newMax
}

function getCursor_v2(cursor: CursorResize | CursorRotation) {
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
