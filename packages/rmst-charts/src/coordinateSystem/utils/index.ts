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

function calcPerfect(max: number, min: number) {
  const tempMax = getBeautifulValMax(max - min)

  const base = [1, 2, 3, 4, 5]

  const intervals = base.map(item => (item * tempMax) / 10)
  const minCount = 4
  const maxCount = 6

  let perfectCount
  let perfectInterval

  let perfectMax
  let perfectMin

  for (const inter of intervals) {
    perfectMax = ceilByMultiple(max, inter)
    perfectMin = floorByMultiple(min, inter)

    const decimalCount = (perfectMax - perfectMin) / inter
    if (minCount <= decimalCount && decimalCount <= maxCount) {
      perfectCount = Math.ceil(decimalCount)
      perfectInterval = inter
      break
    }
  }

  const intervalCount = (perfectMax - perfectMin) / perfectInterval
  const tickValues: number[] = Array.from(
    { length: intervalCount + 1 },
    (_, index) => perfectMin + index * perfectInterval
  )

  const ans = { perfectMax, perfectMin, perfectInterval, intervalCount, tickValues }

  return ans
}

// return 100
function floorByMultiple(num = 123, multiple = 100) {
  const stack = []
  let i = 0
  while (!stack.length || stack.at(-1) <= num) {
    stack.push(i * multiple)
    i++
  }

  return stack.at(-2)
}

// return 200
function ceilByMultiple(num = 123, multiple = 100) {
  let i = 0
  let _num: number
  while (_num === undefined || _num <= num) {
    _num = i * multiple
    i++
  }

  return _num
}

const getBeautifulValMax = (t: number) => {
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
    t = getBeautifulValMax(t / 10) * 10
  }

  return t
}
