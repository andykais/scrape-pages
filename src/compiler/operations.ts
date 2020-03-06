import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
// type imports
import * as i from 'scrape-pages/types/instructions'
import { Stream } from 'scrape-pages/types/internal'
import { Compiler } from './'

// note that this observable has no observer.complete()
// it runs indefidently until either an error or an unsubscribe
function loop(
  pipeTo: Stream.Operation,
  iterateFn: (index: number) => Stream.Payload
): Rx.Observable<Stream.Payload> {
  return new Rx.Observable(observer => {
    let subscribed = true
    let sourceSubscriber: Rx.Subscription | null = null
    observer.add(() => {
      subscribed = false
      if (sourceSubscriber) sourceSubscriber.unsubscribe()
    })
    ;(async () => {
      try {
        for (let index = 0; subscribed; index++) {
          const source = Rx.of(iterateFn(index)).pipe(pipeTo)

          await new Promise((resolve, reject) => {
            sourceSubscriber = source.subscribe({
              next(v) {
                observer.next(v)
              },
              error(error) {
                reject(error)
              },
              complete() {
                resolve()
              }
            })
          })
          sourceSubscriber = null
        }
      } catch (error) {
        observer.error(error)
      }
    })()
  })
}

// lets write a few of these to find out what can be abstracted
function mapCommands(compiler: Compiler, operation: { commands: i.Command[] }): Stream.Operation {
  const commands: Stream.Operation[] = operation.commands
    .map(compiler.instantiateCommand)
    .map(command => ops.flatMap(command.stream)) // TODO reset payload index to zero?

  return Rx.pipe.apply(Rx, commands)
}

// when output from commands completes, restart the loop
function loopCommands(compiler: Compiler, operation: { commands: i.Command[] }): Stream.Operation {
  const commandsOperation = mapCommands(compiler, operation)

  // prettier-ignore
  return ops.flatMap((payload: Stream.Payload) => loop(
      commandsOperation,
      index => payload.set('index', index)
    )
  )
}

export { mapCommands }
