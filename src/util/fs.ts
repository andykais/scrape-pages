import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const [exists, readFile, mkdir] = [fs.readFile, fs.exists, fs.mkdir].map(
  promisify
)

export { exists, readFile }

export const mkdirpSync = (folder: string) => {
  try {
    fs.mkdirSync(folder)
  } catch (e) {
    if (e.code === 'ENOENT') {
      mkdirpSync(path.dirname(folder))
      mkdirpSync(folder)
    } else if (e.code !== 'EEXIST') {
      throw e
    }
  }
}
export const mkdirp = async (folder: string) => {
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
