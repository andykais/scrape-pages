type Input = { [string]: number | string | boolean }

type OptionsAny = {|
  cache?: boolean,
  folder?: string
|}

export type Options = {|
  input?: Input,
  ...OptionsAny,
  folder: string,
  maxConcurrent?: number,
  rateLimit: {|
    rate: number,
    limit: number
  |},
  optionsEach?: {|
    [string]: {|
      ...OptionsAny,
      useLimiter?: boolean
    |}
  |}
|}
