interface Options {
  fetch?: {
    maxConcurrency?: number
    rateLimit?: {
      interval: number
      limit: number
    }
    cache?: boolean
  }
  inputs?: { [inputSlug: string]: string }
  // folder: string
  // cleanFolder?: boolean
  // forceStart?: boolean
}

export { Options }
