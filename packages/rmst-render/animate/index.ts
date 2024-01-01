import { Easing, calcTargetValue, calculateColorTransition, easingFuncs } from './utils'

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
export class Animator {
  constructor(startProp = {}, targetProp = {}, cfg: AnimateCartoonConfig = {}) {
    this.startProp = startProp
    this.targetProp = targetProp

    this.cfg = { ...defaultCfg, ...cfg }
  }

  cfg: AnimateCartoonConfig

  startProp
  targetProp

  rafTimer: number

  start() {
    let startTime: number

    const { duration, easing, during } = this.cfg
    const keys = Object.keys(this.targetProp)

    const rafCb = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
      }

      const elapsedTimeRatio = easingFuncs[easing](Math.min((timestamp - startTime) / duration, 1))

      const currentProp = {}
      keys.forEach(propKey => {
        const startValue = this.startProp[propKey]
        const endValue = this.targetProp[propKey]

        // 如果是颜色
        if (typeof startValue === 'string' && typeof endValue === 'string') {
          const color = calculateColorTransition(startValue, endValue, elapsedTimeRatio)
          currentProp[propKey] = color

          return
        }

        const targetValue = calcTargetValue(this.startProp[propKey], this.targetProp[propKey], elapsedTimeRatio)
        currentProp[propKey] = targetValue
      })

      this.onUpdate(currentProp, elapsedTimeRatio)

      if (during) {
        during(elapsedTimeRatio, currentProp)
      }

      if (elapsedTimeRatio < 1) {
        this.rafTimer = requestAnimationFrame(rafCb)
      }

      if (elapsedTimeRatio === 1) {
        this.onDone()
      }
    }

    requestAnimationFrame(rafCb)
  }

  onUpdate(currentProp, elapsedTimeRatio: number) {}

  onDone() {}
}
