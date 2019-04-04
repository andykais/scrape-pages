import { use } from 'chai'
import chaiExclude from 'chai-exclude'
import * as chaiJestSnapshot from 'chai-jest-snapshot'

use(chaiExclude)
use(chaiJestSnapshot)

before(function() {
  chaiJestSnapshot.resetSnapshotRegistry()
})
