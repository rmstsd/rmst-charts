import WhiteboardEditor from '../whiteboardEditor'
import { ToolEnum, ToolEnumKey } from './ToolManager/constant'
import { ICustomHandleController } from './ToolManager/type'
import { RectController } from './ToolManager/ToolSelect/ToolHandle/RectController'
import { EllipseController } from './ToolManager/ToolSelect/ToolHandle/EllipseController'

export default class ControlHandleManager {
  private controllers: Map<ToolEnumKey, ICustomHandleController> = new Map()

  constructor(private wbEditor: WhiteboardEditor) {
    this.registerControllers()
  }

  private registerControllers() {
    this.controllers.set(ToolEnum.Rect as ToolEnumKey, new RectController())
    this.controllers.set(ToolEnum.Ellipse as ToolEnumKey, new EllipseController())
  }

  getController(wbType: ToolEnumKey): ICustomHandleController | undefined {
    return this.controllers.get(wbType)
  }
}
