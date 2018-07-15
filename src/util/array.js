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

export const groupBy = (
  array,
  key,
  value,
  includeGroupByKey = false,
  resultSelector = v => v
) => {
  const { length } = array
  let collector = {}
  const groupedArray = []

  for (let i = 0; i < length; i++) {
    const item = array[i]
    const itemValue = item[key]

    if (itemValue === value && i !== 0) {
      groupedArray.push(collector)
      collector = {}
    }
    if (includeGroupByKey || itemValue !== key) {
      const collectorArray = collector[itemValue] || []
      collector[itemValue] = collectorArray
      collectorArray.push(resultSelector(item))
    }
  }
  groupedArray.push(collector)
  return groupedArray
}
