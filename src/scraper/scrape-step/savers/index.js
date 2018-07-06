import { resolve, normalize, basename } from 'path'
import format from 'string-template'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'
import { takeWhileHardStop } from '../../../util/rxjs-operators'
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
      return new URL(populatedUriString)
    } catch (e) {
      throw new Error(`cannot create url from "${populatedUriString}"`)
    }
  }

  saveUrl = (url, runParams) => {
    if (this.config.name === 'level_0_index_0') this.logger.warn(url)
    this.logger.debug(this.config.name, url)
    const { folder } = this.options
    if (this.config.scrapeEach.length) {
      return downloadToFileAndMemory(url, folder, this.logger)
    } else {
      return downloadToFileOnly(url, folder, this.logger)
    }
  }

  downloadSourceFunc = (runParams, parentIndexes) => value => {
    return this.startSource.pipe(
      ops.mergeMap(async incrementIndex => {
        // console.log('url time!')
        const url = this.populateTemplate(runParams, value, incrementIndex)
        const downloadId = await this.store.insertFileToBeDownloaded(
          this.name,
          0,
          incrementIndex,
          url
        )
        const urlContent = await this.saveUrl(url, runParams)
        return { value: urlContent, downloadId }
      }, 1),
      ops.catchError(error => {
        // missing pages are not fatal errors
        if (error.code === 'ENOTFOUND') {
          this.logger.warn(error.message)
          return Rx.of('') // TODO find better solution involving takeWhileHardStop
        } else {
          throw error
        }
      })
    )
  }
  _run = this.downloadSourceFunc
}

export default (setupParams, io) => {
  if (setupParams.config.download) return new UrlSaver(setupParams, io)
  else return new IdentityStep(setupParams)
}
