import * as Rx from 'rxjs'

const translateAsyncGeneratorToObservable = async (
  generator: () => AsyncIterableIterator<any>,
  destination: Rx.Subscriber<{}>
) => {
  try {
    for await (const value of generator()) {
      destination.next(value)
      if (destination.closed) break
    }
    destination.complete()
  } catch (e) {
    destination.error(e)
  }
}

const fromAsyncGenerator = (generator: () => AsyncIterableIterator<any>) =>
  new Rx.Observable(destination => {
    // separate function necessary because typescript observable does not allow async function
    translateAsyncGeneratorToObservable(generator, destination)
  })

export { fromAsyncGenerator }
