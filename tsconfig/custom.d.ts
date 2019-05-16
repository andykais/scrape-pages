declare module '*.sql' {
  const content: string
  export default content
}

declare module 'jsonpath-plus' {
  export const JSONPath: any
}
