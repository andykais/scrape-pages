export const mapObject = <T, V>(
  object: { [key: string]: T },
  fn: (value: T, key: string) => V
) => {
  const mappedObject: { [key: string]: V } = {}
  for (const key in object) {
    mappedObject[key] = fn(object[key], key)
  }
  return mappedObject
}
