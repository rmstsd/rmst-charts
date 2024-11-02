import { Stage } from '../..'
import EventEmitter from '../../event_emitter'

export class KeyboardMng extends EventEmitter<Events> {
  constructor(private stage: Stage) {
    super()
  }
}
