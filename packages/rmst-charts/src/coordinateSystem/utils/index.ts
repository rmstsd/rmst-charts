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

  // return calcPerfect_2(maxRealValue, minRealValue)

  return calcPerfect(maxRealValue, minRealValue)
}

// 计算理想的 y轴最大值, 最小值, 刻度间隔

function calcPerfect(max: number, min: number) {
  const tempMax = getStandardInterval(max - min)
  const base = [1, 2, 3, 4, 5]

  const intervals = base.map(item => (item * tempMax) / 10)
  const minCount = 4
  const maxCount = 6

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

  const ans = { perfectMax, perfectMin, perfectInterval, intervalCount, tickValues }

  console.log(ans)

  return ans
}

function calcPerfect_2(max: number, min: number) {
  console.log(max, min)
  const max_p = maxP(max)
  const min_p = minP(min)
  console.log(max_p, min_p)

  const perMax = getStandardInterval(max)

  const intervalCount = 5
  const perfectInterval = getStandardInterval((max_p - min_p) / intervalCount)
  console.log(perfectInterval)

  const tickValues: number[] = Array.from(
    { length: intervalCount },
    (_, index) => perMax - index * perfectInterval
  ).toReversed()

  console.log(tickValues)

  // const tickValues = []
  // let i = 0

  // while (!tickValues.at(0) || tickValues.at(0) >= min) {
  //   tickValues.unshift(perMax - i * perfectInterval)
  //   i++
  // }

  console.log(tickValues)

  return {
    perfectMax: perMax,
    perfectMin: min_p,
    perfectInterval,
    intervalCount: tickValues.length - 1,
    tickValues
  }

  function maxP(max) {
    const zhenshuMax = Math.ceil(max)
    const aa = String(zhenshuMax)

    const dd = aa.slice(0, 1) + '.' + aa.slice(1)
    const ff = `1${'0'.repeat(aa.length - 1)}`
    const max_p = Math.ceil(Number(dd)) * Number(ff)
    return max_p
  }

  function minP(min) {
    const zhenshuMax = Math.floor(min)
    const aa = String(zhenshuMax)

    const dd = aa.slice(0, 1) + '.' + aa.slice(1)
    const ff = `1${'0'.repeat(aa.length - 1)}`
    const min_p = Math.floor(Number(dd)) * Number(ff)

    return min_p
  }
}

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

const getStandardInterval = (t: number) => {
  if (t <= 0.1) {
    t = 0.1
  } else if (t <= 0.2) {
    t = 0.2
  } else if (t <= 0.25) {
    t = 0.25
  } else if (t <= 0.3) {
    t = 0.3
  } else if (t <= 0.5) {
    t = 0.5
  } else if (t < 1) {
    t = 1
  } else {
    t = getStandardInterval(t / 10) * 10
  }

  return t
}
