const slugRegex = /^[a-zA-Z-_]*$/

export const validateSlug = (slugStr: string) => {
  if (!slugRegex.test(slugStr)) {
    throw new Error(`"${slugStr}" is not valid. Allowed characters are ${slugRegex.toString()}`)
  }
}
