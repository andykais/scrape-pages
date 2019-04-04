declare module '*.sql' {
  const content: string
  export default content
}

declare module 'flow-runtime' {
  const content: {}
  export default content
}

// mocha-step is missing typescript types
declare function step(...args: ArgumentTypes<typeof it>): ReturnType<typeof it>

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

type ThenArg<T> = T extends Promise<infer U> ? U : T

type Nullable<T> = T | null
type Voidable<T> = T | void
