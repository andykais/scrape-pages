import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const [exists, readFile, mkdir] = [fs.readFile, fs.exists, fs.mkdir].map(
  promisify
)

export { exists, readFile }

export const mkdirp = async folder => {
  try {
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
