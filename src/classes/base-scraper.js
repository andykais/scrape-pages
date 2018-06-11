import { mergeMap } from 'rxjs/operators'


class BaseScraper {
  constructor(params) {
    Object.assign(this, params)
  }

  run = async runParams => {
    // console.log(runParams)
    return this._run(runParams)
    // this._run(runParams).pipe(
      // mergeMap(this.flatten)
    // )
    // return {
      // ...runParams,
      // parentValue: value
    // }
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
