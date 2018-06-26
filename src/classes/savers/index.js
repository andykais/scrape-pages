import { resolve, normalize, basename } from 'path'
import format from 'string-template'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'
import { takeWhileHardStop } from '../../rxjs-operators'
import {
  downloadToFileAndMemory,
  downloadToFileOnly,
  downloadToMemoryOnly
} from './fetchers'

class UrlSaver extends BaseStep {
  constructor(...args) {
    super(...args)
    // url index source will either increment or be single value based on config
    this.startSource = this.config.download.increment ? Rx.interval() : Rx.of(0)
  }

  populateTemplate = ({ input }, value, index) => {
    // TODO add nice error messages for bad urls
    const incrementIndex =
      this.config.download.initialIndex + index * this.config.download.increment

    const templateVars = { ...input, value, index: incrementIndex }

    const populatedUriString = format(
      this.config.download.template,
      templateVars
    )
    try {
      const populatedUrl = new URL(populatedUriString)
      return populatedUrl
    } catch (e) {
      throw new Error(`cannot create url from "${populatedUriString}"`)
    }
  }

  saveUrl = (url, runParams) => {
    const folder = resolve(runParams.options.folder, this.config.name)
    if (this.config.scrapeEach.length) {
      return downloadToFileAndMemory(url, folder, this.logger)
    } else {
      return downloadToFileOnly(url, folder, this.logger)
    }
  }

  downloadSourceFunc = (runParams, parentIndexes) => value =>
    this.startSource.pipe(
      ops.mergeMap(incrementIndex => {
        const url = this.populateTemplate(runParams, value, incrementIndex)
        // const filepath = resolve(
        // runParams.options.folder,
        // this.config.name,
        // [...parentIndexes, incrementIndex].join('-')
        // )
        return this.saveUrl(url, runParams)
      }, 1)
      // ops.take(this.download.increment ? Infinity : 1)
    )

  _run = this.downloadSourceFunc
}

export default (setupParams, io) => {
  if (setupParams.config.download) return new UrlSaver(setupParams, io)
  else return new IdentityStep(setupParams)
}
