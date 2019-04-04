import * as RxTesting from 'rxjs/testing'
import { expect } from 'chai'

type RunHelpers = ArgumentTypes<ArgumentTypes<RxTesting.TestScheduler['run']>[0]>[0]
const rxjsTestScheduler = (marbleTestEnv: (helpers: RunHelpers) => void) => {
  const scheduler = new RxTesting.TestScheduler((actual, expected) => {
    // asserting the two objects are equal
    // e.g. using chai.
    expect(actual).deep.equal(expected)
  })
  scheduler.run(helpers => {
    marbleTestEnv(helpers)
  })
}

export { rxjsTestScheduler }
