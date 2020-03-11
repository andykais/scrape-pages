interface Options {
  network?: {
    maxConcurrent?: number
    rateLimit?: {
      ratePerMs: number
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
