import { Easing, easingFuncs, calcTargetValue } from './utils'

export type AnimateCartoonConfig = {
  duration?: number // 毫秒
  delay?: number
  during?: (percent: number, newState: Record<string, string | number>) => void
  done?: Function
  aborted?: Function
  scope?: string
  force?: boolean
  additive?: boolean
  setToFinal?: boolean
  easing?: Easing
}

const defaultCfg: AnimateCartoonConfig = { duration: 1000, easing: 'linear' }
export class AnimatorSingle {
  constructor(startValue, endValue, cfg: AnimateCartoonConfig = {}) {
    this.startValue = startValue
    this.endValue = endValue

    this.cfg = { ...defaultCfg, ...cfg }
  }

  cfg: AnimateCartoonConfig

  startValue: number
  endValue: number

  cenValue: number

  rafTimer: number
  startTime: number = null

  runing = false

  setStartValue(v) {
    this.startValue = v
  }

  setEndValue(nvEnd: number) {
    if (this.endValue === nvEnd) {
      return
    }

    this.endValue = nvEnd

    if (this.runing) {
      this.startTime = performance.now()
      this.startValue = this.cenValue
    }

    if (!this.runing) {
      this.start()
    }
  }

  start() {
    this.runing = true

    const { duration, easing, during } = this.cfg

    const rafCb = (perNowTime: number) => {
      if (!this.startTime) {
        this.startTime = perNowTime
      }

      const elapsedTimeRatio = easingFuncs[easing](Math.min((perNowTime - this.startTime) / duration, 1))
      this.cenValue = calcTargetValue(this.startValue, this.endValue, elapsedTimeRatio) as number

      this.onUpdate(this.cenValue, elapsedTimeRatio)

      if (during) {
        // during(elapsedTimeRatio, targetValue)
      }

      if (elapsedTimeRatio < 1) {
        this.rafTimer = requestAnimationFrame(rafCb)
      }

      if (elapsedTimeRatio === 1) {
        this.runing = false
        this.startTime = null
        this.startValue = this.endValue
        this.onDone()
      }
    }

    requestAnimationFrame(rafCb)
  }

  onUpdate(currentProp, elapsedTimeRatio?: number) {}

  onDone() {}

  stop() {
    this.runing = false
    cancelAnimationFrame(this.rafTimer)
  }
}
