import * as I from './instructions'

interface RateLimit {
  maxConcurrent?: number
  throttleMs?: number
}
interface Options {
  FETCH?: {
    rate?: RateLimit
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
  SET?: {
    defaults?: {}
  }
  inputs?: { [inputSlug: string]: string }
  // folder: string
  // cleanFolder?: boolean
  // forceStart?: boolean
}

export { Options, RateLimit }
