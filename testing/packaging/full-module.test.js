const http = require('http')
const { scrape } = require('scrape-pages')

process.on('unhandledRejection', e => {
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
        id: 1,
        scraper: 'value',
        parsedValue: 'find me',
        downloadData: '["http://localhost:8001/",{"headers":{},"method":"GET"}]',
        filename: null,
        byteLength: '93.0',
        complete: 1
      }
    ]
  }
]

const config = {
  flow: [{ name: 'value', download: 'http://localhost:8001', parse: '.here' }]
}
const options = {}
const params = {
  folder: 'downloads'
}

server.listen(8001, async () => {
  console.log('Server started on port 8001.')

  const scraper = scrape(config, options, params)
  const emitter = await scraper.start()

  await new Promise(resolve => {
    emitter.on('done', () => {
      const result = scraper.query(['value'])
      if (JSON.stringify(result) === JSON.stringify(EXPECTED_RESULT)) {
        console.log('Success! The scraper appears to function.')
      } else {
        throw new Error('Scraper result did not match the expected')
      }
      resolve()
    })
  })

  server.close()
  console.log('Server closed.')
})
