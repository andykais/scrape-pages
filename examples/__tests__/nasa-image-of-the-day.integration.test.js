import nasaIotdConfig from '../nasa-image-of-the-day.config'
import PageScraper from '../../src/'

describe('nasa iotd config', () => {
  test('is properly typed', async () => {
    const siteScraper = new PageScraper(nasaIotdConfig)
    const runner = siteScraper.run()
    await new Promise(resolve => {
      runner.on('done', d => {
        console.log('done.')
        console.log(d)
        resolve()
      })
    })
  })
})
