// @ts-check
import { dpr } from './constant.js'

export function initCanvas(canvasContainer) {
  const { offsetWidth, offsetHeight } = canvasContainer

  const canvasElement = document.createElement('canvas')
  const canvasWidth = offsetWidth * dpr
  const canvasHeight = offsetHeight * dpr

  canvasElement.width = canvasWidth
  canvasElement.height = canvasHeight
  canvasElement.style.width = '100%'
  canvasElement.style.height = '100%'

  const ctx = canvasElement.getContext('2d')
  ctx.font = '16px 微软雅黑'
  ctx.scale(dpr, dpr)

  canvasContainer.append(canvasElement)

  return { canvasElement, ctx }
}

export function initToolTip(canvasContainer) {
  const toolTipElement = document.createElement('section')
  const toolTipElementStyle = {
    display: 'none',
    width: '150px',
    position: 'absolute',
    left: 0,
    top: 0,
    transition: 'transform .1s',
    whiteSpace: 'nowrap',
    zIndex: 50,
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderRadius: '4px',
    color: 'rgb(255, 255, 255)',
    font: '14px / 21px dinRegular',
    padding: '5px',
    pointerEvents: 'none'
  }
  Object.keys(toolTipElementStyle).forEach(key => (toolTipElement.style[key] = toolTipElementStyle[key]))

  const labelArray = ['时间', '开盘价', '收盘价', '最高价', '最低价']
  const valueElementArray = []
  const tipElementArray = labelArray.map(item => {
    const tipItemElement = document.createElement('div')
    const labelElement = document.createElement('span')
    const valueElement = document.createElement('span')

    const toolItemElementStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
    Object.keys(toolItemElementStyle).forEach(key => (tipItemElement.style[key] = toolItemElementStyle[key]))

    labelElement.innerText = item
    valueElementArray.push(valueElement)
    tipItemElement.append(labelElement, valueElement)

    return tipItemElement
  })

  toolTipElement.append(...tipElementArray)

  canvasContainer.append(toolTipElement)

  return { toolTipElement, valueElementArray }
}
