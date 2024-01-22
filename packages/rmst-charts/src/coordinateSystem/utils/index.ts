interface PerfectTick {
  perfectMax: number
  perfectMin: number
  perfectInterval: number
  intervalCount: number
  tickValues: number[]
}

// 返回刻度轴的 业务数据的完美数据 暂时不考虑负数
export const calcPerfectTick = (data: number[], isPolar?: boolean): PerfectTick => {
  if (data.length === 0) {
    return { perfectMax: 0, perfectMin: 0, perfectInterval: 0, intervalCount: 0, tickValues: [] }
  }

  if (data.length === 1) {
    data = data.concat(0)
  }

  const maxRealValue = Math.max(...data)
  const minRealValue = isPolar ? 0 : Math.min(...data) // 如果是极坐标系, 则最小值为0 (临时方案, 与 echarts 效果不一致)

  return calcPerfect(maxRealValue, minRealValue)
}

// 计算理想的 y轴最大值, 最小值, 刻度间隔

function calcPerfect(max: number, min: number) {
  const intervals = [300, 200, 100, 50, 30, 20, 10, 5, 4, 3, 2, 1]
  const minCount = 4
  const maxCount = 7

  let perfectCount
  let perfectInterval

  let perfectMax
  let perfectMin

  for (const inter of intervals) {
    perfectMax = ceil(max, inter)
    perfectMin = floor(min, inter)

    const decimalCount = (perfectMax - perfectMin) / inter
    if (decimalCount >= minCount && decimalCount <= maxCount) {
      perfectCount = Math.ceil(decimalCount)
      perfectInterval = inter
      break
    }
  }

  const intervalCount = (perfectMax - perfectMin) / perfectInterval // 间隔数量

  const tickValues: number[] = Array.from(
    { length: intervalCount + 1 },
    (_, index) => perfectMin + index * perfectInterval
  )

  return { perfectMax, perfectMin, perfectInterval, intervalCount, tickValues }

  // return 100
  function floor(num = 123, multiple = 100) {
    const stack = []
    let i = 0
    while (!stack.length || stack[stack.length - 1] <= num) {
      stack.push(i * multiple)
      i++
    }
    stack.pop()
    return stack.pop()
  }
  // return 200
  function ceil(num = 123, multiple = 100) {
    const stack = []
    let i = 0
    while (!stack.length || stack[stack.length - 1] <= num) {
      stack.push(i * multiple)
      i++
    }
    return stack.pop()
  }
}
