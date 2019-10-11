/**
 * flatten: flatten the array by one level
 * this is a polyfill for es2018
 */
export const flatten = <T>(array: T[][]): T[] =>
  array.reduce((acc: T[], innerArray) => {
    acc.push(...innerArray)
    return acc
  }, [])
