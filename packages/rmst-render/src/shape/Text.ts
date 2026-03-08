import { IShapeType } from '../type'
import { BoxData } from './Box'
import UiBase, { UiBaseData } from './UiBase'

const defaultData: TextData = {
  fillStyle: '#333',
  fontSize: 14,
  textAlign: 'left',
  textBaseline: 'top'
}

export interface TextData extends UiBaseData {
  content?: string
  fontSize?: number
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline

  boxData?: BoxData
}

export class Text extends UiBase<TextData> {
  constructor(data: TextData) {
    super(data, defaultData)
  }

  get type(): IShapeType {
    return 'Text'
  }

  declare data: TextData
}

export default Text
