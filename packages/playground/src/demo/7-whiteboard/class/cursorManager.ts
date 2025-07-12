import type * as CSS from 'csstype'
import { rad2deg } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { range } from 'es-toolkit'

const getScaleSvg = (rotateDeg: number) => {
  return `
    <svg height='32' width='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg' style='color: #000000;'>
      <defs>
        <filter id='shadow' y='-40%' x='-40%' width='180px' height='180%' color-interpolation-filters='sRGB'>
          <feDropShadow dx='1' dy='-0.9999999999999999' stdDeviation='1.2' flood-opacity='.5' />
        </filter>
      </defs>
      <g fill='none' transform='rotate(${90 + rotateDeg} 16 16)' filter='url(#shadow)'>
        <path
          d='m9 17.9907v.005l5.997 5.996.001-3.999h1.999 2.02v4l5.98-6.001-5.98-5.999.001 4.019-2.021.002h-2l.001-4.022zm1.411.003 3.587-3.588-.001 2.587h3.5 2.521v-2.585l3.565 3.586-3.564 3.585-.001-2.585h-2.521l-3.499-.001-.001 2.586z'
          fill='#ffffff' />
        <path
          d='m17.4971 18.9932h2.521v2.586l3.565-3.586-3.565-3.585v2.605h-2.521-3.5v-2.607l-3.586 3.587 3.586 3.586v-2.587z'
          fill='#000000' />
      </g>
    </svg>
  `
    .replaceAll('\n', '')
    .replaceAll('\r', '')
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
    .replaceAll('\n', '')
    .replaceAll('\r', '')
}

function getCursorString(svgString: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = window.URL.createObjectURL(blob)
  return `url("${url}") 16 16, auto`
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

type CursorResize = { type: 'resize'; rotation: number }
type CursorRotation = { type: 'rotation'; rotation: number }

type WbCursor = CSS.Property.Cursor | CursorResize | CursorRotation

export default class CursorManager {
  constructor(private wbEditor: WhiteboardEditor) {}

  public setCursor(cursor: WbCursor) {
    const cursorString = typeof cursor === 'string' ? cursor : getCursor_v2(cursor)

    this.wbEditor.stage.canvasElement.style.setProperty('cursor', cursorString)
  }
}

function getCursor_v2(cursor: CursorResize | CursorRotation) {
  let svgString = ''

  switch (cursor.type) {
    case 'resize': {
      svgString = getScaleSvg(cursor.rotation)
      break
    }
    case 'rotation': {
      svgString = getRotationSvg(cursor.rotation)
      break
    }
  }

  const cursorString = getCursorString(svgString)

  return cursorString
}
