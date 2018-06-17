import expect from 'expect'
import type { Config } from '../src/configuration/type'

expect.extend({
  toBeConfigType: receivedConfig => {
    try {
      const testConfig: Config = receivedConfig
      return {
        message: () => 'passed',
        pass: true
      }
    } catch (e) {
      return {
        message: () => e.toString(),
        pass: false
      }
    }
  }
})

// setup reusable variables
global.__SIMPLE_CONFIG__ = {
  scrape: {
    download: 'example-site.com/images',
    parse: {
      selector: 'img',
      attribute: 'src'
    },
    scrapeEach: {
      download: '{value}'
    }
  }
}
