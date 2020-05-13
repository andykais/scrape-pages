import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import * as RxTesting from 'rxjs/testing'
import { expect } from 'chai'
import { dslParser } from '@scrape-pages/dsl-parser'
import { Queue, Task } from '../index'

type TestTask<T> = () => Rx.Observable<T>
function queueWithHooks(queue: Queue, handlers: { onStart?: () => void }) {
  const { onStart = () => {} } = handlers
  const enqueue = Rx.of(null).pipe(
    ops.tap(onStart),
    ops.filter(() => false)
  )
  return Rx.merge(queue.scheduler, enqueue)
}

function taskWithHooks<T>(task: TestTask<T>, hooks: { onComplete?: () => void }) {
  const { onComplete = () => {} } = hooks
  return () => task().pipe(ops.tap(onComplete))
}

describe(__filename, () => {
  let rxjsTestScheduler: RxTesting.TestScheduler
  beforeEach(() => {
    rxjsTestScheduler = new RxTesting.TestScheduler((actual, expected) => {
      // assert the observables output matches the expected frames
      expect(actual).deep.equal(expected)
    })
  })

  // we dont care about instructions in these tests, so heres a blank program
  const instructions = dslParser(`()`)
  // this task is useful when testing rates
  const instantTask = (v = 'e') => () => Rx.of(v)
  // this task is useful when testing the queue
  const delayedTask = (v = 'v') => () => Rx.of(v).pipe(ops.delay(100))

  describe('without any rate limiting', () => {
    it('should schedule tasks right away', () => {
      const settings = { instructions, folder: '', options: {} }
      const queue = new Queue(settings)

      const onStart = () => {
        queue.push(delayedTask(), 0)
        queue.push(delayedTask(), 0)
      }

      const expected = '100ms (vv)'

      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler).toBe(expected))
    })
  })
  describe('with maxConcurrent only', () => {
    it('should keep unscheduled values in the priority queue, not the observable', () => {
      const rateSettings = { maxConcurrent: 1 }
      const settings = { instructions, folder: '', options: { FETCH: { rate: rateSettings } } }
      const queue = new Queue(settings)

      const onTaskComplete = () => {
        expect(queue.size).to.equal(1)
      }
      const onStart = () => {
        queue.push(taskWithHooks(delayedTask(), { onComplete: onTaskComplete }), 0)
        queue.push(delayedTask(), 0)
      }

      const expected = '100ms v 99ms v'
      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler).toBe(expected))
    })
    it('should schedule multiple values at once if able', () => {
      const rateSettings = { maxConcurrent: 2 }
      const settings = { instructions, folder: '', options: { FETCH: { rate: rateSettings } } }
      const queue = new Queue(settings)

      const onStart = () => {
        queue.push(delayedTask(), 0)
        queue.push(delayedTask(), 0)
        queue.push(delayedTask(), 0)
      }
      const expected = '100ms (vv) 96ms v'
      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler).toBe(expected))
    })
  })
  describe('with rateLimit only', () => {
    it('should pop from the queue on each interval', () => {
      const rateSettings = { throttleMs: 200 }
      const settings = { instructions, folder: '', options: { FETCH: { rate: rateSettings } } }
      const queue = new Queue(settings)

      const onStart = () => {
        queue.push(instantTask(), 0)
        queue.push(instantTask(), 0)
        // queue.push(task, 0)
      }
      const expected = 'e 199ms e'
      const unsub = '1000ms !'
      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler, unsub).toBe(expected))
    })
    it('should pop from the queue on each interval even when tasks take longer than the interval', () => {
      const rateSettings = { throttleMs: 50 }
      const settings = { instructions, folder: '', options: { FETCH: { rate: rateSettings } } }
      const queue = new Queue(settings)

      const onStart = () => {
        queue.push(delayedTask(), 0)
        queue.push(delayedTask(), 0)
      }
      const expected = '100ms v 49ms v'
      const unsub = '1000ms !'

      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler, unsub).toBe(expected))
    })
  })

  describe('with maxConcurrency and rateLimit', () => {
    it('should pop values using the rate limit but not go over the maxConcurrency', () => {
      const rateSettings = { maxConcurrent: 2, throttleMs: 25 }
      const settings = { instructions, folder: '', options: { FETCH: { rate: rateSettings } } }
      const queue = new Queue(settings)

      const onStart = () => {
        // gets scheduled right away
        queue.push(delayedTask(), 0)
        // gets scheduled after 25ms
        queue.push(delayedTask(), 0)
        // gets scheduled after the first task completes (100ms)
        queue.push(delayedTask(), 0)
      }
      const expected = '100ms v 24ms v 74ms v'
      const unsub = '1000ms !'
      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler, unsub).toBe(expected))
    })
  })

  describe('with priorities', () => {
    it('should schedule lower priorities first', () => {
      const rateSettings = { maxConcurrent: 1 }
      const settings = { instructions, folder: '', options: { FETCH: { rate: rateSettings } } }
      const queue = new Queue(settings)

      const onStart = () => {
        // really just a placeholder task so the next three arent popped off the queue right away
        queue.push(delayedTask(), 0)
        // higher priority (second arg) means it is scheduled sooner
        queue.push(delayedTask('b'), 1)
        queue.push(delayedTask('c'), 0)
        queue.push(delayedTask('a'), 2)
      }
      const expected = '100ms v 99ms a 99ms b 99ms c'
      const unsub = '1000ms !'
      const scheduler = queueWithHooks(queue, { onStart })
      rxjsTestScheduler.run(helpers => helpers.expectObservable(scheduler, unsub).toBe(expected))
    })
  })
})
