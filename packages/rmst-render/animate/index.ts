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
    const totalChangedVal = Math.abs(startVal - targetVal)
    const per = elapsedTimeRatio * totalChangedVal

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
