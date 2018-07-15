import https from 'https'
import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import { resolve, basename } from 'path'
import sanitize from 'sanitize-filename'
import { readFile, exists, mkdirp } from '../../../util/fs-promise'

const sanitizeUrl = url => sanitize(url.toString(), { replacement: '_' })

export const downloadToFileAndMemory = ({ folder }, { queue }, url) => {
  const filename = resolve(folder, sanitizeUrl(url))

  return queue
    .add(() => fetch(url))
    .then(
      response =>
        new Promise((resolve, reject) => {
          const dest = createWriteStream(filename)
          const buffers = []
          response.body.pipe(dest)
          response.body.on('error', error => reject(error))
          response.body.on('data', data => buffers.push(data))
          dest.on('error', error => reject(error))
          dest.on('close', () => resolve(Buffer.concat(buffers)))
        })
    )
    .then(buffer => ({
      downloadValue: buffer.toString(),
      filename
    }))
}
export const downloadToFileOnly = ({ folder }, { queue, logger }, url) => {
  const filename = resolve(folder, sanitizeUrl(url))

  return (
    queue
      .add(
        () =>
          new Promise(resolve => {
            const req = https.request(url.toString(), response =>
              resolve(response)
            )

            req.end()
          })
      )
      // .add(() => fetch(url))
      .then(
        response =>
          new Promise((resolve, reject) => {
            const dest = createWriteStream(filename)
            // response.body.pipe(dest)
            // response.body.on('error', error => reject(error))
            response.pipe(dest)
            response.on('error', error => reject(error))
            dest.on('error', error => reject(error))
            dest.on('close', resolve)
          })
      )
      .then(buffer => ({
        downloadValue: buffer.toString(),
        filename
      }))
  )
}

export const downloadToMemoryOnly = (runParams, { queue }, url) =>
  queue
    .add(() => fetch(url))
    .then(response => response.text())
    .then(downloadValue => ({
      downloadValue
    }))

export const readFromFile = ({ folder }, dependencies, url) => {
  const filename = resolve(folder, sanitizeUrl(url))

  return readFile(filename).then(buffer => ({
    downloadValue: buffer.toString()
  }))
}

// const headers = {
// Host: url.host,
// authority: 'antontang.deviantart.com',
// pragma: 'no-cache',
// 'cache-control': 'no-cache',
// 'save-data': 'off',
// 'upgrade-insecure-requests': '1',
// 'user-agent':
// 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.62 Safari/537.36',
// accept:
// 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
// }
