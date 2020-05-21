import { expect } from 'chai'

type PartialQueryResult = { [label: string]: { [column: string]: any }[] }[]
function assertQueryResultPartial(
  queryResult: any,
  expectedPartial: PartialQueryResult,
  { ignoreOrderInGroups = false } = {}
) {
  const resultCopy = JSON.parse(JSON.stringify(queryResult))
  for (const [i, group] of expectedPartial.entries()) {
    if (resultCopy.length <= i) break
    for (const [label, rows] of Object.entries(group)) {
      if (!resultCopy[i].hasOwnProperty(label)) break
      for (const [j, row] of rows.entries()) {
        if (resultCopy[i][label].length <= j) break
        resultCopy[i][label][j] = {}
        for (const column of Object.keys(row)) {
          resultCopy[i][label][j][column] = queryResult[i][label][j][column]
        }
      }
      if (ignoreOrderInGroups) {
        const expectedRowIsSorted = expectedPartial[i][label].every((row, i, group) => {
          return i === 0 || JSON.stringify(group[i - 1]).localeCompare(JSON.stringify(row)) <= 0
        })
        if (!expectedRowIsSorted) {
          throw new Error(
            `The expected array needs to be sorted at expectedPartial[${i}][${label}], sorry`
          )
        }
        resultCopy[i][label].sort((a: {}, b: {}) =>
          JSON.stringify(a).localeCompare(JSON.stringify(b))
        )
      }
    }
  }
  expect(resultCopy).to.be.deep.equal(expectedPartial)
}

export { assertQueryResultPartial }
