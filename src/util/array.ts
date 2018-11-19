export const groupBy = <T>(
  array: { [key: string]: any }[],
  key: string,
  value: T,
  includeGroupByKey = false,
  resultSelector: (v: any) => any = v => v
) => {
  const { length } = array
  let collector: { [key: string]: any } = {}
  const groupedArray = []

  for (let i = 0; i < length; i++) {
    const item = array[i]
    const itemValue = item[key]

    if (itemValue === value && i !== 0) {
      groupedArray.push(collector)
      collector = {}
    }
    if (includeGroupByKey || itemValue !== value) {
      const collectorArray = collector[itemValue] || []
      collector[itemValue] = collectorArray
      collectorArray.push(resultSelector(item))
    }
  }
  groupedArray.push(collector)
  return groupedArray
}
