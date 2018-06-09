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
    build_url: {
      template: 'example-site.com/images'
    },
    scrape_each: {
      parse: {
        selector: 'img',
        attribute: 'src'
      }
    }
  }
}
