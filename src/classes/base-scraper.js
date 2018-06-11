class BaseScraper {
  constructor(params) {
    Object.assign(this, params)
  }

  run = runParams => {
    const value = this._run(runParams)
    return {
      ...runParams,
      parentValue: value
    }
  }

  flatten = (acc, val) => {
    return acc.concat(
      val.parentValue.map(parentValue => ({
        ...val,
        parentValue
      }))
    )
  }
}

export default BaseScraper
