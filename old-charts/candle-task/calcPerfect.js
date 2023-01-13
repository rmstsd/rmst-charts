// @ts-check

// 计算理想的 y轴最大值, 最小值, 刻度间隔
export default function calcPerfect(max, min) {
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

  return { perfectMax, perfectMin, perfectInterval }

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
