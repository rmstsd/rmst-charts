import { Group, Stage } from 'rmst-render'

import { ToolEnum } from './class/ToolManager/constant'

import SelectedManager from './class/selectedManager'
import ToolManager from './class/ToolManager/ToolManager'
import Camera from './class/camera'
import { CoordSys } from './class/coordSys'
import CursorManager from './class/cursorManager'
import { Ruler, rulerSize } from './class/ruler'
import { Keyboard } from './class/keyboard'

import { Graph_Id } from './constant'
import EventEmitter from 'rmst-render/event_emitter'
import { RefLine } from './class/refLine'
import { PreferenceConfig } from './class/preference-config'

// 只是为了 log 的时候好区别
class GraphLayerWithRulerWrapper extends Group {}
class RulerLayer extends Group {}
class GraphLayer extends Group {}
class HoveredLayer extends Group {}
class CtrlBoxLayer extends Group {}
class TempLayer extends Group {}
class RefLineLayer extends Group {}

export interface Events {
  render: () => void // 只要白板内的元素的状态有变化，就触发 (不包含相机的平移缩放)
}

class WhiteboardEditor {
  constructor() {}

  container: HTMLElement

  eventEmitter = new EventEmitter<Events>()

  stage: Stage

  graphLayerWithRulerWrapper = new GraphLayerWithRulerWrapper({ name: 'wrapper by ruler', x: rulerSize, y: rulerSize })
  graphLayer = new GraphLayer({ id: Graph_Id.graph_root_group, name: 'wb-canvas 图形层' })
  hoveredLayer = new HoveredLayer({ name: 'hovered 层', pointerEvents: 'none' })
  ctrlBoxLayer = new CtrlBoxLayer({ name: 'ctrl 层' })

  tempLayer = new TempLayer({ name: 'temp 层' })

  rulerLayer = new RulerLayer({ name: '标尺层' }) // 拖出来的红线
  refLineLayer = new RefLineLayer({ name: '参考线层' })

  camera = new Camera(this)
  keyboard = new Keyboard(this)
  coordSys = new CoordSys(this)
  toolManager = new ToolManager(this)
  selectManager = new SelectedManager(this)
  cursorManager = new CursorManager(this)
  refLine = new RefLine(this)
  ruler = new Ruler(this)

  preferenceConfig = new PreferenceConfig(this)

  dispose() {
    this.stage?.dispose()
    this.camera.dispose()
    this.toolManager.dispose()
    this.selectManager.dispose()
    this.ruler.dispose()
    this.keyboard.dispose()
  }

  init(container: HTMLElement) {
    this.container = container

    this.stage = new Stage({ container, enableCamera: false, enableCursor: false })
    this.graphLayerWithRulerWrapper.append(
      this.graphLayer,
      this.hoveredLayer,
      this.ctrlBoxLayer,
      this.tempLayer,
      this.refLineLayer
    )
    this.stage.append(this.graphLayerWithRulerWrapper, this.rulerLayer)

    this.toolManager.switchTool(ToolEnum.Select)
    this.toolManager.bindEvent()

    this.camera.bindEvent()
    this.selectManager.bindEvent()
    this.ruler.bindEvent()
    this.keyboard.bindEvent()
  }

  triggerRender() {
    this.eventEmitter.emit('render')
  }
}

export default WhiteboardEditor
