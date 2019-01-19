/**
 * priority queue
 * higher numbers equal higher priority
 * e.g. priority one is popped before priority zero
 */
export class PriorityQueue<T = any> {
  public length = 0
  private priorities: number[] = []
  private queue: { [priority: number]: T[] } = {}

  // all priorities used in the push function are defined in the constructor
  public constructor(availablePriorities: number[]) {
    for (const priority of availablePriorities) {
      this.priorities.push(priority)
      this.queue[priority] = []
    }
    this.priorities.sort((a: number, b: number) => b - a)
  }

  public pop = () => {
    for (const priority of this.priorities) {
      const queueSlot = this.queue[priority]
      if (queueSlot.length) {
        this.length--
        return queueSlot.shift()
      }
    }
  }

  public push = (val: T, priority: number) => {
    this.queue[priority].push(val)
    this.length++
  }
}
