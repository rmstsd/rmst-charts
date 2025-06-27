import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  width: 200,
  height: 100
}

interface EllipseData extends AbstractUiData {
  width?: number
  height?: number
}

export class Ellipse extends AbstractUi<EllipseData> {
  constructor(data: EllipseData) {
    super('Ellipse', data, defaultData)
  }

  declare data: EllipseData

  getBBox() {
    const data = this.data

    return { x: 0, y: 0, width: data.width, height: data.height }
  }
}

export default Ellipse
