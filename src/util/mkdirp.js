import { mkdir } from 'fs'

export const mkdirP = async folder =>
  new Promise((resolve, reject) =>
    mkdir(folder, err => {
      if (err && err.code !== 'EEXIST') reject(err)
      else resolve()
    })
  )
