declare module '*.sql' {
  const content: string
  export default content
}

declare module Chai {
  interface TypeComparison {
    equalQueryResult(expectedResult: any): Assertion
    haveEvents(
      eventCountExpected: { [eventName: string]: number },
      checkAfterPromise: Promise<any>
    ): Assertion
    haveEvent(event: string, expectedCount: number, checkAfterPromise: Promise<any>): Assertion
  }
}
