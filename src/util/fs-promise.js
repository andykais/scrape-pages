import fs from 'fs'
import { promisify } from 'util'

export const exists = promisify(fs.exists)

export const read = promisify(fs.readFile)

export const mkdirp = async folder =>
  new Promise((resolve, reject) =>
    fs.mkdir(folder, err => {
      if (err && err.code !== 'EEXIST') reject(err)
      else resolve()
    })
  )

