import { Stream } from '@scrape-pages/types/internal'
import { compileTemplate } from '@scrape-pages/util/handlebars'
// type imports
import { Template } from '@scrape-pages/util/handlebars'

const cache = {}
const memo = <T>(fn: (fnArg: T) => any) => (fnArg: T, cacheKey: string) => {
  // if (cache[cacheKey]) return cache[cacheKey]
  // else return
}

class ExpressionEvaluator {
  private cache = {}
  private template: Template

  constructor(expressionTemplate: string) {
    this.template = compileTemplate(expressionTemplate)
  }

  eval(payload: Stream.Payload) {
    const javascriptEvalStr = this.template(payload)

    const result = eval(javascriptEvalStr)
    return result
    // const cacheKey = `index:${payload.index}-value:${payload.value}`
  }
}

class BooleanExpressionEvaluator extends ExpressionEvaluator {
  eval(payload: Stream.Payload) {
    return Boolean(super.eval(payload))
  }
}

export { BooleanExpressionEvaluator }
