class PriorityQueue<T> {
  public length: number
  private sortedMap: Map<number, T[]>

  public constructor() {
    this.length = 0
    this.sortedMap = new Map()
  }

  public pop(): T | undefined {
    for (const queue of this.sortedMap.values()) {
      if (queue.length > 0) {
        this.length--
        return queue.shift()
      }
    }
  }

  public push(val: T, priority: number) {
    const maybeQueue = this.sortedMap.get(priority)
    if (maybeQueue) {
      maybeQueue.push(val)
    } else {
      // is this atomic?
      this.sortedMap.set(priority, [val])
      this.sortedMap = new Map([...this.sortedMap.entries()].sort(([p1], [p2]) => p2 - p1))
    }
    this.length++
  }
}
export { PriorityQueue }
