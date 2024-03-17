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

const queue = [() => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}]

export class AnimatorSingle {
  constructor(startValue, endValue, cfg: AnimateCartoonConfig = {}) {
    this.startValue = startValue
    this.endValue = endValue
    this.centerValue = startValue

    this.cfg = { ...defaultCfg, ...cfg }
  }

  cfg: AnimateCartoonConfig

  startValue: number
  endValue: number

  centerValue: number

  rafTimer: number
  startTime: number = null

  runing = false

  private isBreak = false

  setBreak(breakk: boolean) {
    this.isBreak = breakk
    // setTimeout(() => {
    //   this.isBreak = breakk
    // }, 300)
  }

  setStartValue(v) {
    this.startValue = v
  }

  setEndValue(nvEnd: number) {
    this.endValue = nvEnd

    // if (this.runing) {
    //   this.startTime = performance.now()
    //   this.startValue = this.centerValue
    // }

    if (!this.runing) {
      this.start()
    }
  }

  setDuration(ms: number) {
    this.cfg.duration = ms
  }

  handEnd = false

  setAheadEnd() {
    this.handEnd = true
    this.onUpdate(this.endValue, 1)
    this.setBreak(true)
    this.stop()
  }

  start() {
    this.runing = true

    const rafCb = (perNowTime: number) => {
      const { duration, easing, during } = this.cfg

      if (!this.startTime) {
        this.startTime = perNowTime
      }

      // 修改 duration 中断任务 直接到终点
      // 延迟中断 isBreak 不一定跑到终点
      // 控制发布任务 的频率

      const elapsedTimeRatio = Math.min((perNowTime - this.startTime) / duration, 1)
      this.centerValue = calcTargetValue(this.startValue, this.endValue, elapsedTimeRatio) as number
      this.onUpdate(this.centerValue, elapsedTimeRatio)

      if (elapsedTimeRatio < 1 && !this.isBreak) {
        this.rafTimer = requestAnimationFrame(rafCb)
      }

      if (elapsedTimeRatio === 1) {
        this.onUpdate(this.centerValue, elapsedTimeRatio)

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
