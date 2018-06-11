import format from 'string-template'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'
import http from 'https'
import mime from 'mime-types'
import { createWriteStream } from 'fs'

class BaseSaver extends BaseStep {
  populateTemplate = ({ input }) => {
    // TODO add vars like _index, parentValue
    const templateVars = input
    const templatedUrl = new URL(this.build_url.template)

    // sanitize the parameter templates, then the whole string, then feed back into URL
    templatedUrl.searchParams.forEach((val, key, map) => {
      const sanitizedParam = format(val, templateVars).replace(/\s/g, '+')
      map.set(key, sanitizedParam)
    })
    const populatedUrl = new URL(format(this.build_url.template))
    populatedUrl.searchParams.forEach((v, key, map) =>
      map.set(key, templatedUrl.searchParams.get(key))
    )
    return populatedUrl
  }

  saveUrl = (url, { options }) =>
    new Promise((resolve, reject) => {
      // console.log(url.toString())
      const req = http
        .get(url.toString(), async response => {
          // const timeout = n => new Promise(resolve => setTimeout(resolve, n))
          const [text] = await Promise.all([
            this.reader(response, options),
            this.writer(response, options)
          ])
          resolve(text)
        })
        .on('error', reject)
      req.end()
      // http.request
    })
  writer = (response, options) => {
    // TODO add expectedOutput extension?
    const extension = mime.extension(response.headers['content-type'])
    return new Promise((resolve, reject) => {
      if (options.cache) {
        response
          .pipe(createWriteStream(`filename.${extension}`))
          .on('error', reject)
          .on('close', resolve)
      } else {
        resolve()
      }
    })
  }
  reader = response =>
    new Promise((resolve, reject) => {
      let data = ''
      response.on('data', incoming => {
        // console.log('incoming')
        data += incoming.toString()
      })
      response.on('error', reject)
      response.on('end', () => {
        resolve(data)
      })
      // response.on('close', resolve(data))
    })
}
class UrlSaver extends BaseSaver {
  _run = async runObject => {
    // console.log('saving url', runObject.parentValue)
    const url = this.populateTemplate(runObject)
    // console.log('get url', url)
    const result = await this.saveUrl(url, runObject)
    return [result]
  }
}
class UrlSaverIncrement extends BaseSaver {
  _run = async runObject => {
    const { increment_by, initial_index } = this.build_url

    // TODO look into observable 'map request result until no more'
    let index = initial_index
    let result
    const results = []
    do {
      index += increment_by
      result = undefined
      result && results.push(result)
    } while (result)
    return results
  }
}
class IdentitySaver extends BaseSaver {}

export default setupParams => {
  if (setupParams.build_url === false) return new IdentityStep(setupParams)
  else return new UrlSaver(setupParams)
}
