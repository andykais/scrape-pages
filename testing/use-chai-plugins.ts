import * as path from 'path'
import { use } from 'chai'
import chaiExclude from 'chai-exclude'
import chaiJestSnapshot from 'chai-jest-snapshot'

use(chaiExclude)
use(chaiJestSnapshot)

before(function() {
  chaiJestSnapshot.resetSnapshotRegistry()
})

// beforeEach(function() {
//   const { currentTest } = this
//   const filename = path.resolve(
//     path.dirname(currentTest.file),
//     '__snapshots__',
//     path.basename(path.basename(currentTest.file)) + '.snap'
//   )
//   // console.log(currentTest)
//   console.log(currentTest.fullTitle())
//   console.log({ 'currentTest.file': currentTest.file, filename })
//   chaiJestSnapshot.setFilename(filename)
//   chaiJestSnapshot.setTestName(currentTest.fullTitle())
// })
