import { mergeMap } from 'rxjs/operators'


class BaseScraper {
  constructor(params, io) {
    Object.assign(this, params)
  }

  // run = this._run
  run = (runParams, parentIndexes) => (value, index) => {
    return this._run(runParams, parentIndexes)(value, index)
  }

  flatten = (acc, val) => {
    return acc.concat(
      (val.parentValue || []).map(parentValue => ({
        ...val,
        parentValue
      }))
    )
  }
}

export default BaseScraper
