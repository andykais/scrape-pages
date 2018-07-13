import format from 'string-template'

const constructUrl = (config, { input }, { value, incrementIndex }) => {
  const { initialIndex, increment } = config.download
  const index = initialIndex + incrementIndex * increment
  const templateVals = { ...input, value, index }
  const populatedUriString = format(config.download.template, templateVals)
  try {
    return new URL(populatedUriString)
  } catch (e) {
    throw new Error(`cannot create url from "${populatedUriString}"`)
  }
}

export { constructUrl }
