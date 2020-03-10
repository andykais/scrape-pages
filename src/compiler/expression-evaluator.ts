import { Stream } from '@scrape-pages/types/internal'

const cache = {}
const memo = <T>(fn: (fnArg: T) => any) => (fnArg: T, cacheKey: string) => {
  // if (cache[cacheKey]) return cache[cacheKey]
  // else return
}

class ExpressionEvaluator {
  private cache = {}
  constructor(expressionTemplate: string) {}

  eval(payload: Stream.Payload) {
    const inputs = payload.inputs
    const value = payload.value
    const index = payload.index
    // const cacheKey = `index:${payload.index}-value:${payload.value}`
  }
}

class BooleanExpressionEvaluator extends ExpressionEvaluator {
  eval(payload: Stream.Payload) {
    return Boolean(super.eval(payload))
  }
}

export { ExpressionEvaluator }
