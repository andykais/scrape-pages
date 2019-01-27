export const mapObject = <T, V>(
  object: { [key: string]: T },
  fn: (key: string, value: T) => V
) => {
  const mappedObject: { [key: string]: V } = {}
  for (const key in object) {
    mappedObject[key] = fn(key, object[key])
  }
  return mappedObject
}
