import { Stage } from '../..'
import EventEmitter from '../../event_emitter'

class KeyboardMng extends EventEmitter<Events> {
  constructor(private stage: Stage) {
    super()
  }
}

export default KeyboardMng
