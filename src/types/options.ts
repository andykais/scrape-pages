interface Options {
  requests: {
    maxConcurrent?: number
    rateLimit?: {
      ratePerMs: number
      limit: number
    }
  }
  inputs?: { [inputSlug: string]: string }
  folder: string
  cleanFolder?: boolean
  forceStart?: boolean
}

export { Options }
