const once = <V>(fn: (...args: any[]) => V) => (...args: any[]): V => {
  let calledOnce = false
  let result: V
  if (calledOnce) {
    result = fn(...args)
    calledOnce = true
  }
  return result!
}

export { once }
