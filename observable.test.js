import EventEmitter from 'events'
import { range, from, fromEvent } from 'rxjs'
import { map, flatMap, filter, mergeMap } from 'rxjs/operators'

test('it should trickle down', async () => {
  const timeout = millis => id =>
    new Promise(resolve => setTimeout(() => resolve(id), millis))

  const wait1s = timeout(1000)
  const saver = new EventEmitter()

  const identity = (name = 'IDENTITY') => val => {
    console.log(name, val)
    return val
  }

  const flatten = val => {
    return val.parentValue.map(parentValue => ({
      ...val,
      parentValue
    }))
  }
  const flattenIdentity = v => [v]
  const topParser = () => {
    // identity
    return [
      {
        parentValue: null
      }
    ]
  }
  const normalFilter = val => val.parentValue
  const identityFilter = val => val
  // get index html
  const topSaver = ({ parentValue }) => {
    return from([{ parentValue }]).pipe(
      map(identity('TOP_SAVER')),
      flatMap(() =>
        timeout(1000)({
          parentValue: ['<body><ul class="pagination"></ul></body>']
        })
      )
    )
  }

  const getPageUrlsParser = async () => ({
    parentValue: ['g.com/page/1', 'g.com/page/2', 'g.com/page/3']
  })

  const imagePageSaver = ({ parentValue }) => {
    // return wait1s()
    const n = parseInt(parentValue[parentValue.length - 1])
    console.log(parentValue)
    const obs = from([{ parentValue }]).pipe(
      flatMap(v =>
        timeout(n * 1000)({
          parentValue: ['<body><img src=""></body>']
        })
      )
      // map(identity('AFTER'))
    )
    // obs.subscribe(v => console.log(v))
    return obs
    // for (const i of [1,2,3]) {
    // }
  }

  const obs = from(topParser()).pipe(
    map(identity('PARSE')),
    mergeMap(flattenIdentity),
    // save
    mergeMap(topSaver),
    map(identity('SAVE')),
    filter(flatten),
    // children
    flatMap(val =>
      [1, 2].map(() =>
        from(getPageUrlsParser()).pipe(
          flatMap(flatten),
          map(identity('CHILD_PARSE')),
          mergeMap(imagePageSaver),
          map(identity('CHILD_SAVE')),
          filter(flatten)
        )
      )
    ),
    flatMap(childObservable => childObservable)

    // map(identity('FINAL'))
    // flatMap(val => getPageUrls(val))
  )
  // const obs = from([{ a: 0 }]).pipe(
  // map(identity('START')),
  // flatMap(val => emitValuesSlowly())
  // // flatMap(val => wait1s(val))
  // )

  // obs.subscribe(val => console.log('DUMP:', val))

  await obs.toPromise()
  console.log('done.')
})
