import EventEmitter from 'events'
import fillInDefaults from '../configuration/fill-in-defaults'
import chooseParser from './parsers'
import chooseSaver from './savers'
// import Rx from 'rxjs/Rx'
import { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, scan, flatMap, mergeScan, mergeMap, filter } from 'rxjs/operators'

import type { Config } from '../configuration/type'

export class Scraper {
  constructor({ parse, build_url, scrape_each }, io) {
    const childless = !Boolean(scrape_each)
    const { expect: expectedInput } = parse || {}
    const { expect: expectedOutput } = childless
      ? {}
      : scrape_each[0].parse || {}

    this.parse = chooseParser({ parse, expectedInput })
    this.save = chooseSaver({ build_url, expectedOutput })
    this.children = (scrape_each || []).map(scrape => new Scraper(scrape, io))
    this.emitter = io.emitter
  }

  run = ({ input, options, parentValue }) => {

    // console.log('begin.')
    // console.log(this.parse.run({ parentValue, ...runParams }))
    const identity = (name = 'IDENTITY') => v => {
      console.log(name, v)
      return v
    }
    const stop = () => false

    const obs = from([{ parentValue, input, options }]).pipe(
      map(identity('INITIAL')),
      flatMap(this.parse.run),
      map(identity('PARSED')),
      mergeMap(this.parse.flatten), // collect all at once
      map(identity('FLATTENED_PARSE')),
      flatMap(this.save.run),
      map(identity('SAVED')),
      mergeMap(this.save.flatten), // collect all at once
      map(identity('FLATTENED_SAVE')),
      filter(stop),
      // mergeMap(this.save.flatten, []), // collect but let each trickle down
      // map(identity('FLATTENED_SAVE')),
      // mergeMap(returned => this.children.map(child => child.run(returned)), [])
    )
    // .subscribe(val => {
    // console.log('DUMP:', val)
    // })
    return obs
    // return obs.pipe(toPromise)
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
  constructor(config: Config) {
    this.config = fillInDefaults(config)
    this.emitter = new EventEmitter() // dependency inject?
    this.scrapingScheme = new Scraper(this.config.scrape, {
      emitter: this.emitter
    })
  }

  // TODO add parsable input for this first parse step
  run = (input = {}, options = {}) => {
    if (!this.isValidInput(input)) throw new Error('invalid input')
    const o = this.scrapingScheme
      .run({ input, options, parentValue: [] })
      .toPromise()
      .then(output => this.emitter.emit('done', output))
    return this.emitter
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
