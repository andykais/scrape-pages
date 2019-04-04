import { EventEmitter } from 'events'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { rateLimitToggle } from '../conditional-rate-limiter'
// testing imports
import { rxjsTestScheduler } from '../../../../../testing/setup'

describe('conditional-rate-limiter operator', () => {
  const emitter = new EventEmitter()
  const toggler = Rx.fromEvent<boolean>(emitter, 'toggle')
  const rateLimitConfig = {
    useLimiterFirst: true,
    rate: 1000,
    limit: 1,
    maxConcurrent: 1
  }

  describe('use maxConcurrent only', () => {
    // in reality we use promises, but this mocks the behavior of a request just fine
    const executor = () => Rx.of('v').pipe(ops.delay(1000))
    const handlers = { toggler, executor }

    it('should limit concurrent requests to one at a time with maxConcurrent: 1', () => {
      const configuration = { ...rateLimitConfig, useLimiterFirst: false, maxConcurrent: 1 }
      const rateLimitToggleOperator = rateLimitToggle(handlers, configuration)

      rxjsTestScheduler(helpers => {
        const { cold, expectObservable } = helpers
        const incomingRequests = cold('-a-b-c-----|')
        const expected = '- 1000ms v 999ms v 999ms v'

        expectObservable(incomingRequests.pipe(rateLimitToggleOperator)).toBe(expected)
      })
    })
    it('should handle requests at the same time matching maxConcurrent', () => {
      const configuration = { ...rateLimitConfig, useLimiterFirst: false, maxConcurrent: 3 }
      const rateLimitToggleOperator = rateLimitToggle(handlers, configuration)

      rxjsTestScheduler(helpers => {
        const { cold, expectObservable } = helpers
        const incomingRequests = cold('-a-b-c-d-e-|')
        // the concurrency is a sliding scale, so once the first execution resolves, the next is allowed in
        const expected = '- 1000ms v-v-v 995ms v-v'
        expectObservable(incomingRequests.pipe(rateLimitToggleOperator)).toBe(expected)
      })
    })

    it('should handle requests on top of each other if they come in that manner', () => {
      const configuration = { ...rateLimitConfig, useLimiterFirst: false, maxConcurrent: 3 }
      const rateLimitToggleOperator = rateLimitToggle(handlers, configuration)

      rxjsTestScheduler(helpers => {
        const { cold, expectObservable } = helpers
        // 500ms is within the window of the first three executing, so it should resolve alongside the others
        const incomingRequests = cold('-(abc)-d 500ms -e-|')
        // the concurrency is a sliding scale, so once the first execution resolves, the next is allowed in
        const expected = '- 1000ms (vvv) 995ms (vv)'
        expectObservable(incomingRequests.pipe(rateLimitToggleOperator)).toBe(expected)
      })
    })
  })

  describe('use rateLimit only', () => {
    const executor = () => Rx.of('v').pipe(ops.delay(1000))
    const handlers = { toggler, executor }

    it('should execute one after the other since the delay matches the rate', () => {
      const configuration = rateLimitConfig
      const rateLimitToggleOperator = rateLimitToggle(handlers, configuration)

      rxjsTestScheduler(helpers => {
        const { cold, expectObservable } = helpers
        const incomingRequests = cold('-a-b-c-----|')
        // TODO change the execution so the first request does not wait for the timer to make one whole interval
        const expected = ' 2000ms v 999ms v 999ms v'

        expectObservable(incomingRequests.pipe(rateLimitToggleOperator)).toBe(expected)
      })
    })

    it('rate: 0 should act identical to maxConcurrent: 0', () => {
      const configuration = { ...rateLimitConfig, rate: 0 }
      const rateLimitToggleOperator = rateLimitToggle(handlers, configuration)

      rxjsTestScheduler(helpers => {
        const { cold, expectObservable } = helpers
        const incomingRequests = cold('-a-b-c-----|')
        const expected = '- 1000ms v 999ms v 999ms v'

        expectObservable(incomingRequests.pipe(rateLimitToggleOperator)).toBe(expected)
      })
    })

    it('should work when there is a ton of them', () => {
      const configuration = { ...rateLimitConfig, rate: 1000, limit: 3, maxConcurrent: Infinity }
      const rateLimitToggleOperator = rateLimitToggle(handlers, configuration)

      rxjsTestScheduler(helpers => {
        const { cold, expectObservable } = helpers
        const incomingRequests = cold('-a-b-c-d-e-|')
        const expected = '2000ms (vvv) 995ms (vv)'

        expectObservable(incomingRequests.pipe(rateLimitToggleOperator)).toBe(expected)
      })
    })
  })
})
