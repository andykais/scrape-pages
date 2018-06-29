const init = Symbol('init')

export const findMin = (array, isLessThan) => {
  return array.reduce((min, val) => {
    if (min === init || !isLessThan(min, val)) return val
    else return min
  }, init)
}

export const findMax = (array, isGreaterThan) => {
  return array.reduce((max, val) => {
    if (max === init || !isGreaterThan(max, val)) return val
    else return max
  }, init)
}
