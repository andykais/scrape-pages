import PageScraper from './classes'

process.on('unhandledRejection', error => {
  console.error(error)
  process.exit(1)
})

export default PageScraper
