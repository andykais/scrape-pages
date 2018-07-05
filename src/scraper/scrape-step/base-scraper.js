class BaseScraper {
  constructor(params, io) {
    Object.assign(this, params)
  }

  runSetup = options => (this.options = options)

  // run = this._run
  run = (runParams, parentIndexes) => (value, index) => {
    return this._run(runParams, parentIndexes)(value, index)
  }
}

export default BaseScraper
