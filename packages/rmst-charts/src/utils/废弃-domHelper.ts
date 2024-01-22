export function initToolTip(canvasContainer: HTMLElement) {
  const toolTipElement = document.createElement('section')
  const toolTipElementStyle = {
    display: 'none',
    width: '150px',
    position: 'absolute',
    left: '0',
    top: '0',
    transition: 'transform .1s',
    whiteSpace: 'nowrap',
    zIndex: '50',
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderRadius: '4px',
    color: 'rgb(255, 255, 255)',
    font: '14px / 21px dinRegular',
    padding: '5px',
    pointerEvents: 'none'
  }

  Object.keys(toolTipElementStyle).forEach((key: keyof typeof toolTipElementStyle) => {
    toolTipElement.style[key] = toolTipElementStyle[key]
  })

  const labelArray = ['时间', '开盘价', '收盘价', '最高价', '最低价']
  const valueElementArray: HTMLSpanElement[] = []
  const tipElementArray = labelArray.map(item => {
    const tipItemElement = document.createElement('div')
    const labelElement = document.createElement('span')
    const valueElement = document.createElement('span')

    const toolItemElementStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
    Object.keys(toolItemElementStyle).forEach((key: keyof typeof toolItemElementStyle) => {
      tipItemElement.style[key] = toolItemElementStyle[key]
    })

    labelElement.innerText = item
    valueElementArray.push(valueElement)
    tipItemElement.append(labelElement, valueElement)

    return tipItemElement
  })

  toolTipElement.append(...tipElementArray)

  canvasContainer.append(toolTipElement)

  return { toolTipElement, valueElementArray }
}
