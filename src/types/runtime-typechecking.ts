import { createAssertType } from 'typescript-is'
// import { Instructions } from './instructions.ts'
import { Instructions } from './instructions'

const typecheckInstructions = createAssertType<Instructions>()

// import { N } from './instructions'

// type N = number
// const checkNumber = createAssertType<N>()
// try {
//   checkNumber('1')
//   console.log('no prob')
// } catch(e) {
//   console.log(e.message)
// }


export {
  typecheckInstructions
}
