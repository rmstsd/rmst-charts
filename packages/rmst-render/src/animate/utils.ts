import colorRgba from 'color-rgba'

export const calcTargetValue = (
  startCount: number | number[],
  targetCount: number | number[],
  elapsedTimeRatio: number
) => {
  if (typeof startCount === 'number' && typeof targetCount === 'number') {
    return calcValue(startCount, targetCount)
  } else if (Array.isArray(startCount) && Array.isArray(targetCount)) {
    return startCount.map((item, index) => calcValue(item, targetCount[index]))
  }

  function calcValue(startVal: number, targetVal: number) {
    const totalChangedVal = targetVal - startVal
    const per = elapsedTimeRatio * totalChangedVal

    let cur = startVal + per

    const min = startVal < targetVal ? startVal : targetVal
    const max = startVal > targetVal ? startVal : targetVal

    cur = Math.max(cur, min)
    cur = Math.min(cur, max)

    return cur

    if (startVal < targetVal) {
      const currCount = startVal + per
      return currCount > targetVal ? targetVal : currCount
    }

    if (startVal > targetVal) {
      const currCount = startVal - per

      return currCount < targetVal ? targetVal : currCount
    }

    return targetVal
  }
}

export function interpolateColor(startColor: string, endColor: string, percent: number) {
  if (percent <= 0) {
    return startColor
  } else if (percent >= 1) {
    return endColor
  }

  const [c1_r, c1_g, c1_b, c1_a] = colorRgba(startColor)
  const [c2_r, c2_g, c2_b, c2_a] = colorRgba(endColor)

  const r = Math.round(c1_r + (c2_r - c1_r) * percent)
  const g = Math.round(c1_g + (c2_g - c1_g) * percent)
  const b = Math.round(c1_b + (c2_b - c1_b) * percent)
  const a = c1_a + (c2_a - c1_a) * percent

  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export type Easing = keyof typeof easingFuncs
export const easingFuncs = {
  linear: function (k) {
    return k
  },
  quadraticIn: function (k) {
    return k * k
  },
  quadraticOut: function (k) {
    return k * (2 - k)
  },
  quadraticInOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k
    }
    return -0.5 * (--k * (k - 2) - 1)
  },
  cubicIn: function (k) {
    return k * k * k
  },
  cubicOut: function (k) {
    return --k * k * k + 1
  },
  cubicInOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k + 2)
  },
  quarticIn: function (k) {
    return k * k * k * k
  },
  quarticOut: function (k) {
    return 1 - --k * k * k * k
  },
  quarticInOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k
    }
    return -0.5 * ((k -= 2) * k * k * k - 2)
  },
  quinticIn: function (k) {
    return k * k * k * k * k
  },
  quinticOut: function (k) {
    return --k * k * k * k * k + 1
  },
  quinticInOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2)
  },
  sinusoidalIn: function (k) {
    return 1 - Math.cos((k * Math.PI) / 2)
  },
  sinusoidalOut: function (k) {
    return Math.sin((k * Math.PI) / 2)
  },
  sinusoidalInOut: function (k) {
    return 0.5 * (1 - Math.cos(Math.PI * k))
  },
  exponentialIn: function (k) {
    return k === 0 ? 0 : Math.pow(1024, k - 1)
  },
  exponentialOut: function (k) {
    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
  },
  exponentialInOut: function (k) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if ((k *= 2) < 1) {
      return 0.5 * Math.pow(1024, k - 1)
    }
    return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2)
  },
  circularIn: function (k) {
    return 1 - Math.sqrt(1 - k * k)
  },
  circularOut: function (k) {
    return Math.sqrt(1 - --k * k)
  },
  circularInOut: function (k) {
    if ((k *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - k * k) - 1)
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
  },
  elasticIn: function (k) {
    var s
    var a = 0.1
    var p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p))
  },
  elasticOut: function (k) {
    var s
    var a = 0.1
    var p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    return a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1
  },
  elasticInOut: function (k) {
    var s
    var a = 0.1
    var p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    if ((k *= 2) < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p))
    }
    return a * Math.pow(2, -10 * (k -= 1)) * Math.sin(((k - s) * (2 * Math.PI)) / p) * 0.5 + 1
  },

  // 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
  backIn: function (k) {
    var s = 1.70158
    return k * k * ((s + 1) * k - s)
  },
  backOut: function (k) {
    var s = 1.70158
    return --k * k * ((s + 1) * k + s) + 1
  },
  backInOut: function (k) {
    var s = 1.70158 * 1.525
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s))
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
  },

  // 创建弹跳效果
  bounceIn: function (k) {
    return 1 - easingFuncs.bounceOut(1 - k)
  },
  bounceOut: function (k) {
    if (k < 1 / 2.75) {
      return 7.5625 * k * k
    } else if (k < 2 / 2.75) {
      return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75
    } else if (k < 2.5 / 2.75) {
      return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375
    } else {
      return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375
    }
  },
  bounceInOut: function (k) {
    if (k < 0.5) {
      return easingFuncs.bounceIn(k * 2) * 0.5
    }
    return easingFuncs.bounceOut(k * 2 - 1) * 0.5 + 0.5
  }
}
