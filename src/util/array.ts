/**
 * groups array values until `isSeparator` decides the rows should be separated
 */
export const groupUntilSeparator = <T>(
  array: T[],
  isSeparator: (item: T) => boolean,
  includeSeparator: boolean
): T[][] => {
  const { length } = array
  const groupedArray: T[][] = []
  let grouping = []

  for (let i = 0; i < length; i++) {
    const item = array[i]
    const itemIsSeparator = isSeparator(item)
    if (itemIsSeparator && i !== 0) {
      groupedArray.push(grouping)
      grouping = []
    }
    if (!itemIsSeparator || includeSeparator) {
      grouping.push(item)
    }
  }
  if (grouping.length) groupedArray.push(grouping)
  return groupedArray
}
