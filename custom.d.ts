declare module '*.sql' {
  const content: string
  export default content
}

declare module 'flow-runtime' {
  const content: any
  export default content
}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
  ? A
  : never
