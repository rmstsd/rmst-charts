import WhiteboardEditor from '../../../../whiteboardEditor'
import { ToolEnum, ToolEnumKey } from '../../constant'
import { IToolCustomHandle } from '../../type'
import { ToolCustomHandleRect } from './ToolCustomHandleRect'
import { ToolCustomHandleEllipse } from './ToolCustomHandleEllipse'

export default class ToolCustomHandle {
  private customHandles: Map<ToolEnumKey, IToolCustomHandle> = new Map()

  constructor(private wbEditor: WhiteboardEditor) {
    this.registerCustomHandle()
  }

  private registerCustomHandle() {
    this.customHandles.set(ToolEnum.Rect as ToolEnumKey, new ToolCustomHandleRect())
    this.customHandles.set(ToolEnum.Ellipse as ToolEnumKey, new ToolCustomHandleEllipse())
  }

  getProvider(wbType: ToolEnumKey): IToolCustomHandle | undefined {
    return this.customHandles.get(wbType)
  }
}
