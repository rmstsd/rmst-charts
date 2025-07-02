import { makeAutoObservable } from 'mobx'
import { Group, Stage } from 'rmst-render'
import { ToolEnum, ToolEnumKey } from './class/ToolManager/constant'

import selectedManager from './class/selectedManager'
import ToolManager from './class/ToolManager/ToolManager'
import { IGraph } from './type'
import Camera from './class/camera'
import { Graph_Id } from './constant'

class WhiteboardEditor {
  constructor() {
    makeAutoObservable(this)
  }

  container: HTMLElement

  stage: Stage
  graphLayer = new Group({ id: Graph_Id.graph_root_group, name: '图形层' }) // 图形层
  selectLayer = {
    hoveredGroup: new Group({ name: 'hovered 层', pointerEvents: 'none' }),
    selectToolGroup: new Group({ name: 'ctrl 层' })
  }

  graphs: IGraph[] = []

  selectManager = new selectedManager(this)
  toolManager = new ToolManager(this)
  camera = new Camera(this)

  dispose() {
    this.stage.dispose()
  }

  init(container: HTMLElement) {
    this.container = container

    this.stage = new Stage({ container, enableCamera: false })

    this.stage.append(this.graphLayer)

    this.stage.append(this.selectLayer.hoveredGroup, this.selectLayer.selectToolGroup)

    this.toolManager.switchTool(ToolEnum.Select)
    this.toolManager.bindEvent()

    this.camera.bindEvent()
    this.selectManager.bindEvent()
  }

  client2Stage(evt: PointerEvent) {
    const rect = this.container.getBoundingClientRect()

    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
  }
}

export default WhiteboardEditor
