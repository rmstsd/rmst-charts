import { IShapeType } from '../type'
import UiBase, { UiBaseData } from './UiBase'

const defaultData: TextData = {
  fillStyle: '#333',
  fontSize: 14,
  textAlign: 'left',
  textBaseline: 'top'
}

interface TextData extends UiBaseData {
  x?: number
  y?: number
  content?: string
  fontSize?: number
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
}

export class Text extends UiBase<TextData> {
  constructor(data: TextData) {
    super(data, defaultData)
  }

  type: IShapeType = 'Text'
  declare data: TextData
}

export default Text
