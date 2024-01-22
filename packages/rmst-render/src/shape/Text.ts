import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  fillStyle: '#333',
  fontSize: 14,
  textAlign: 'left' as CanvasTextAlign
}

interface TextData extends AbstractUiData {
  x?: number
  y?: number
  content?: string
  fontSize?: number
  textAlign?: CanvasTextAlign
}

export class Text extends AbstractUi<TextData> {
  constructor(data: TextData) {
    super('Text', data, defaultData)
  }

  declare data: TextData
}

export default Text
