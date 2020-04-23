import { expect } from 'chai'

// function assertQueryResultPartial(queryResult: any, expectedPartial: any) {
//   expect(queryResult).to.have.length(expectedPartial.length)
//   for (let i = 0; i < expectedPartial.length; i++) {
//     const expectedGroup = expectedPartial[i]
//     const actualGroup = queryResult[i]

//     const expectedKeys = Object.keys(expectedGroup)
//     const actualKeys = Object.keys(actualGroup)
//     expect(expectedKeys).to.be.deep.equal(actualKeys)
//     for (const key of expectedKeys) {
//       const expectedLabelRows = expectedGroup[key]
//       const actualLabelRows = actualGroup[key]
//       expect(actualLabelRows).to.have.length(expectedLabelRows.length)
//       for (let row = 0; row < expectedLabelRows.length; row++) {
//         const expectedPartialRow = expectedLabelRows[row]
//         const actualRow = actualLabelRows[row]
//         for (const key in expectedPartialRow) {
//           expect(actualRow).to.have.property(key, expectedPartialRow[key])
//         }
//       }
//     }
//   }
// }

type PartialQueryResult = { [label: string]: { [column: string]: any }[] }[]
function assertQueryResultPartial(queryResult: any, expectedPartial: PartialQueryResult) {
  const resultCopy = JSON.parse(JSON.stringify(queryResult))
  for (const [i, group] of expectedPartial.entries()) {
    if (resultCopy.length <= i) break
    for (const [label, rows] of Object.entries(group)) {
      if (!resultCopy[i].hasOwnProperty(label)) break
      for (const [j, row] of rows.entries()) {
        if (resultCopy[i][label].length <= j) break
        resultCopy[i][label][j] = {}
        for (const [column, value] of Object.entries(row)) {
          resultCopy[i][label][j][column] = queryResult[i][label][j][column] 
        }
      }
    }
  }
  expect(resultCopy).to.be.deep.equal(expectedPartial)
}

export { assertQueryResultPartial }
