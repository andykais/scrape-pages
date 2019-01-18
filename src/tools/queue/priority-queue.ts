/**
 * priority queue
 * higher numbers equal higher priority
 * e.g. priority one is popped before priority zero
 */
export class PriorityQueue<T = any> {
  private priorities: number[] = []
  private queue: { [priority: number]: T[] } = {}
  public length = 0

  // all priorities used in the push function are defined in the constructor
  constructor(availablePriorities: number[]) {
    for (const priority of availablePriorities) {
      this.priorities.push(priority)
      this.queue[priority] = []
    }
    this.priorities.sort((a: number, b: number) => b - a)
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
