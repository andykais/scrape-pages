import format from 'string-template'
import BaseStep from '../base-scraper'
import IdentityStep from '../identity-scraper'
import http from 'https'
import mime from 'mime-types'
import { createWriteStream } from 'fs'

class BaseSaver extends BaseStep {
  populateTemplate = runObject => {
    // TODO add vars like _index, parentValue
    const templateVars = runObject.input
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

  saveUrl = async url =>
    new Promise((resolve, reject) => {
      console.log(url.toString())
      const req = http
        .get(url.toString(), res => {
          console.log(res.headers)
          const extension = mime.extension(res.headers['content-type'])
          console.log(extension)
          res.pipe(this.writer({ extension }))
        })
        .on('error', error => console.error(error))
      req.end()
      // http.request
    })
  writer = ({ extension }) => createWriteStream(`filename.${extension}`)
}
class UrlSaver extends BaseSaver {
  _run = runObject => {
    // console.log('saving url', runObject.parentValue)
    const url = this.populateTemplate(runObject)
    // console.log('get url', url)
    const result = this.saveUrl(url)
    return []
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
