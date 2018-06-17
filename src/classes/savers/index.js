import format from 'string-template'
import request from 'request'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'
import http from 'https'
import { createWriteStream } from 'fs'
import { resolve, basename } from 'path'
import { mkdirP } from '../../util'
import * as Rx from 'rxjs'
import * as ops from 'rxjs/operators'
import { takeWhileHardStop } from '../../rxjs-operators'

class UrlSaver extends BaseStep {
  constructor(...args) {
    super(...args)
    // url index source will either increment or be single value based on config
    this.startSource = this.download.increment ? Rx.interval() : Rx.of(0)
  }

  populateTemplate = ({ input }, value, index) => {
    // TODO add nice error messages for bad urls
    const incrementIndex =
      this.download.initialIndex + index * this.download.increment

    const templateVars = { ...input, value, index: incrementIndex }

    const populatedUriString = format(this.download.template, templateVars)
    try {
      const populatedUrl = new URL(populatedUriString)
      return populatedUrl
    } catch (e) {
      throw new Error(`cannot create url from "${populatedUriString}"`)
    }
  }

  saveUrl = async (url, filepath, runParams) => {
    const uri = url.toString()
    // TODO keep or remove url.search?
    const filename = basename(url.pathname) + url.search
    const file = resolve(filepath, filename)
    await mkdirP(filepath)

    // TODO use asyncIterator stream?
    const buffers = []
    // this.logger.debug(`getting ${uri}`)
    // this.logger.debug(`saving to ${file}`)
    return new Promise((resolve, reject) => {
      // TODO only save if options.save is on
      request(uri)
        .on('data', data => buffers.push(data))
        .pipe(createWriteStream(file))
        .on('error', reject)
        .on('close', () => {
          this.logger.debug(`${this.name} saved ${uri}`)
          resolve(Buffer.concat(buffers).toString())
        })
    })
  }

  downloadSourceFunc = (runParams, parentIndexes) => value =>
    this.startSource.pipe(
      ops.mergeMap(incrementIndex => {
        const url = this.populateTemplate(runParams, value, incrementIndex)
        const filepath = resolve(
          runParams.options.folder,
          this.name,
          [...parentIndexes, incrementIndex].join('-')
        )
        return this.saveUrl(url, filepath, runParams)
      }, 1),
      ops.take(this.download.increment ? Infinity : 1)
    )

  _run = this.downloadSourceFunc
}

export default (setupParams, io) => {
  if (setupParams.download) return new UrlSaver(setupParams, io)
  else return new IdentityStep(setupParams)
}
