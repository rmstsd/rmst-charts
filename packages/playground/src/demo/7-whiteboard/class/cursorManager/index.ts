import type * as CSS from 'csstype'
import WhiteboardEditor from '../../whiteboardEditor'
import { calcRotateRad, isFlipped, normalizeAngle } from '../../constant'
import { rad2deg } from 'rmst-render'
import { range } from 'es-toolkit'
import { duplicateCursor, getRotationSvg, getScaleSvg } from './icon'

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
type CursorSelect = { type: 'select' }
type CursorDuplicate = { type: 'duplicate' } // 复制

type ICursorCustom = CursorResize | CursorRotation | CursorSelect | CursorDuplicate

export type WbCursor = CSS.Property.Cursor | ICursorCustom

export function getCssCursorValue(url: string) {
  return `url("${url}") 16 16, auto`
}

export default class CursorManager {
  constructor(private wbEditor: WhiteboardEditor) {}

  public setCursor(cursor: WbCursor) {
    if (!cursor) {
      console.warn('cursor 为空')
      cursor = 'default'
    }

    const cursorString = typeof cursor === 'string' ? cursor : getCursor_v2(cursor)

    this.wbEditor.stage.canvasElement.style.setProperty('cursor', cursorString)
  }
}

const cursorCached = new Map<string, string>()

{
  genCursor()

  function genCursor() {
    cursorCached.set('select', 'default')
    cursorCached.set('duplicate', duplicateCursor)

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
  if (cursor.type === 'select' || cursor.type === 'duplicate') {
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
