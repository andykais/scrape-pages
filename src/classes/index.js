import fillInDefaults from '../configuration/fill-in-defaults'
import chooseParser from './parsers'
import chooseSaver from './savers'
// import Rx from 'rxjs/Rx'
// import { Observable } from 'rxjs';

import type { Config } from '../configuration/type'

export class Scraper {
  constructor({ parse, build_url, scrape_each }) {
    const childless = !Boolean(scrape_each)
    const { expect: expectedInput } = parse || {}
    const { expect: expectedOutput } = childless
      ? {}
      : scrape_each[0].parse || {}

    this.parse = chooseParser({ parse, expectedInput })
    this.save = chooseSaver({ build_url, expectedOutput })
    this.children = (scrape_each || []).map(scrape => new Scraper(scrape))
  }

  run = ({ input, options }) => {
    const { _parse, ...inputWithoutSpecialVars } = input
    const runParams = {
      input: inputWithoutSpecialVars,
      options
    }

    console.log('begin.')
    // Observable.from({parentValue: _parse, ...runParams})
    // .dump()
    // const val = [{ parentValue: _parse, ...runParams }]
      // .map(returned => this.parse.run(returned))
      // .reduce(this.parse.flatten, [])
      // .map(returned => this.save.run(returned))
      // .reduce(this.save.flatten, [])
      // .map(returned => this.children.map(child => child.run(returned)))
    // console.log(val)
  }
}

class ScrapePages {
  constructor(config: Config, options) {
    this.config = fillInDefaults(config)
    this.scrapingScheme = new Scraper(this.config.scrape)
  }

  run = (input = {}, options = {}) => {
    if (!this.isValidInput(input)) throw new Error('invalid input')
    this.scrapingScheme.run({ input, options })
  }

  isValidInput = input => {
    if (typeof this.config.input === 'string') {
      const inputKeyIsPresent = input[this.config.input]
      if (!inputKeyIsPresent) return false
    } else if (Array.isArray(this.config.input)) {
      const allInputsArePresent = Object.keys(this.config.input).every(
        key => input[key]
      )
      if (!allInputsArePresent) return false
    }
    return true
  }
}

export default ScrapePages
