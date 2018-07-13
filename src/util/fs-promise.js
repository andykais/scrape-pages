import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const { readFile, exists, mkdir } = fs.promises

export { exists, readFile }

export const mkdirp = async folder => {
  try {
    console.log('trying', folder)
    await mkdir(folder)
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdirp(path.dirname(folder))
      await mkdirp(folder)
    } else if (e.code !== 'EEXIST') {
      throw e
    }
  }
}
