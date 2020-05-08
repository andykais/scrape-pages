import * as I from './instructions'

interface Options {
  FETCH?: {
    maxConcurrency?: number
    rateLimit?: {
      interval: number
      limit: number
    }
    defaults?: {
      CACHE?: I.FetchCommand['params']['CACHE']
      READ?: I.FetchCommand['params']['WRITE']
      WRITE?: I.FetchCommand['params']['READ']
    }
  }
  PARSE?: {
    defaults?: {
      MAX?: I.ParseCommand['params']['MAX']
      FORMAT?: I.ParseCommand['params']['FORMAT']
    }
  }
  REPLACE?: {
    defaults?: {
      FLAGS?: I.TextReplaceCommand['params']['FLAGS']
    }
  }
  inputs?: { [inputSlug: string]: string }
  // folder: string
  // cleanFolder?: boolean
  // forceStart?: boolean
}

export { Options }
