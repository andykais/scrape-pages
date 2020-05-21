const http = require('http')
const { ScraperProgram } = require('scrape-pages')

process.on('unhandledRejection', (e) => {
  console.error(e)
  process.exit(1)
})

// start server
const server = http.createServer((req, res) => {
  res.end(`
<html>
  <body>
    <div class='here'>find me</div>
    <div>find me</div>
  </body>
</html>`)
})

const EXPECTED_RESULT = [
  {
    value: [
      {
        value: 'find me',
        filename: null,
        status: null,
        byteLength: null,
        requestParams: null,
      },
    ],
  },
]

const instructions = `
(
  FETCH 'http://localhost:8001'
  PARSE '.here' LABEL='value'
)
`
const folder = 'downloads'
const options = {}

server.listen(8001, async () => {
  console.log('Server started on port 8001.')

  console.log('Scraper instantiated.')
  const scraper = new ScraperProgram(instructions, folder, options)

  console.log('Starting scraper')
  scraper.start()

  console.log('Waiting for scraper to complete.')
  await scraper.toPromise()

  const result = scraper.query(['value'])

  const stringifiedResult = JSON.stringify(result, Object.keys(result).sort())
  const stringifiedExpected = JSON.stringify(EXPECTED_RESULT, Object.keys(EXPECTED_RESULT).sort())
  if (stringifiedResult === stringifiedExpected) {
    console.log('Success! The scraper appears to function and return real values.')
  } else {
    console.error('actual  ', stringifiedExpected)
    console.error('expected', stringifiedResult)
    throw new Error('Scraper result did not match the expected.')
  }

  server.close()
  console.log('Server closed.')
})
