export class PriorityQueue<T = any> {
  private priorities: number[] = []
  private queue: { [priority: number]: T[] } = {}
  public length = 0

  // there are a limited amount of priorities available at the start
  constructor(availablePriorities: number[]) {
    for (const priority of availablePriorities) {
      this.priorities.push(priority)
      this.queue[priority] = []
    }
  }

  pop = () => {
    for (const priority of this.priorities) {
      const queueSlot = this.queue[priority]
      if (queueSlot.length) {
        this.length--
        return queueSlot.shift()
      }
    }
  }

  push = (val: T, priority: number) => {
    this.queue[priority].push(val)
    this.length++
  }
}
