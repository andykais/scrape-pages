import PageScraper from './classes'
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

// TODO move this into a try catch around `run`
// I shouldnt be blocking unhandledRejections here
process.on('unhandledRejection', error => {
  console.error(error)
  process.exit(1)
})

export default PageScraper
