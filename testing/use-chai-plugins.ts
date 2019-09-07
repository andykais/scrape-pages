import * as path from 'path'
import { use } from 'chai'
import chaiExclude from 'chai-exclude'
import chaiJestSnapshot from 'chai-jest-snapshot'
// type imports
import * as mocha from 'mocha'

use(chaiExclude)
use(chaiJestSnapshot)

const getOriginalParent = (testSuite: mocha.Test | mocha.Suite): string =>
  testSuite.parent && testSuite.parent.title ? getOriginalParent(testSuite.parent) : testSuite.title

before(function() {
  chaiJestSnapshot.resetSnapshotRegistry()
})
beforeEach(function() {
  // this works because all our tests start with a describe(__filename, () => {}) block
  const testFile = getOriginalParent(this.currentTest!)
  const fullTitle = this.currentTest!.fullTitle()
  const filename = path.basename(testFile)
  const dirname = path.dirname(testFile)
  const snapshotFile = path.resolve(dirname, '__snapshots__', path.basename(filename) + '.snap')

  chaiJestSnapshot.setFilename(snapshotFile)
  chaiJestSnapshot.setTestName(fullTitle)
})
