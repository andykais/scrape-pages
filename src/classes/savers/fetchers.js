import fetch from 'node-fetch'
import { createWriteStream } from 'fs'
import { resolve, basename, relative, dirname } from 'path'
import sanitize from 'sanitize-filename'
import { read, exists, mkdirp } from '../../util/fs-promise'

const relativeToBaseDir = folder => relative(dirname(dirname(folder)), folder)

const sanitizeUrl = url => sanitize(url.toString(), { replacement: '_' })

export const downloadToFileAndMemory = async (url, folder, logger) => {
  const filename = sanitizeUrl(url)
  const file = resolve(folder, filename)
  try {
    // TODO replace with database knowledge of files downloaded
    const body = await read(file)
    logger.debug('read', relativeToBaseDir(file))
    return body.toString()
  } catch (e) {
    if (e.code !== 'ENOENT') throw e

    const buffers = []
    const dest = createWriteStream(file)
    const response = await fetch(url)
    const body = await new Promise((resolve, reject) => {
      response.body.pipe(dest)
      response.body.on('error', error => reject(error))
      response.body.on('data', data => buffers.push(data))
      dest.on('error', error => reject(error))
      dest.on('close', () => resolve(Buffer.concat(buffers).toString()))
    })
    logger.debug('downloaded', relativeToBaseDir(file))
    return body
  }
}

export const downloadToFileOnly = async (url, folder, logger) => {
  const filename = sanitizeUrl(url)
  const file = resolve(folder, filename)

  const fileIsAlreadySaved = await exists(file)
  if (fileIsAlreadySaved) {
    logger.debug('skipped', relativeToBaseDir(file))
  } else {
    const response = await fetch(url)
    return new Promise((resolve, reject) => {
      const dest = createWriteStream(file)
      response.body.pipe(dest)
      response.body.on('error', error => reject(error))
      dest.on('error', error => reject(error))
      dest.on('close', resolve)
    })
  }
}

export const downloadToMemoryOnly = async (url, logger) => {
  const response = await fetch(url)
  const body = await response.text()
  logger.debug('downloaded', url.toString())
  return body
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
