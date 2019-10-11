const slugRegex = /^[a-zA-Z0-9-_]*$/

export const validateSlug = (slugStr: string) => {
  if (!slugRegex.test(slugStr)) {
    throw new Error(`"${slugStr}" is not valid. Allowed characters are ${slugRegex.toString()}`)
  }
}
