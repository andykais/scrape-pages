class Base {
  static [Symbol.hasInstance](testClass) {
    // if (testClass instanceof Base) return true
    // else return testClass.constructor === Y
  }
}

class Y extends Base {}
class X {
  constructor(clss) {
    this.instanceofIdentifier = clss.constructor.prototype
    clss.constructor.prototype[Symbol.hasInstance] = () => true
    console.log(clss.constructor[Symbol.hasInstance])
  }
  static [Symbol.hasInstance](testClass) {
    console.log('me?')
    return true
  }
  static [Symbol.hasInstance](instance) {
    console.log('me?')
    return Array.isArray(instance)
  }
}

const y = new Y()
const x = new X(y)

console.log({ x })
console.log('y instanceof Y', y instanceof Y)
console.log('x instanceof Y', x instanceof Y)
