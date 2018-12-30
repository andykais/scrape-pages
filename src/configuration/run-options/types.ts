type Input = { [inputName: string]: number | string | boolean }

interface OptionsAny {
  cache?: boolean
}

interface ScraperOptionsInit extends OptionsAny {
  downloadPriority?: number
}
interface ScraperOptions extends OptionsAny {
  cache: boolean
  downloadPriority: number
}

export interface Parallelism {
  maxConcurrent?: number
  rateLimit?: {
    rate: number
    limit: number
  }
}

export interface RunOptionsInit extends OptionsAny, Parallelism {
  input?: Input
  folder: string
  cleanFolder?: boolean
  optionsEach?: {
    [name: string]: ScraperOptionsInit
  }
}

export interface RunOptions extends ScraperOptions {
  input: Input
  folder: string
}

export type FlatRunOptions = {
  [name: string]: RunOptions
}
