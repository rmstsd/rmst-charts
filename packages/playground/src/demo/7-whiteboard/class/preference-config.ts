import EventEmitter from 'rmst-render/event_emitter'
import WhiteboardEditor from '../whiteboardEditor'

interface Events {
  preferenceChange: (config: Preference) => void // 偏好配置发生变化时触发
}

interface Preference {
  skewInResize: boolean // 缩放时是否允许出现倾斜
}

export class PreferenceConfig {
  constructor(private wbEditor: WhiteboardEditor) {}

  eventEmitter = new EventEmitter<Events>()

  preference = {
    skewInResize: true // 缩放时是否允许出现倾斜
  }

  setConfig(preference: Partial<Preference>) {
    this.preference = { ...this.preference, ...preference }

    this.eventEmitter.emit('preferenceChange', this.preference)
  }
}
