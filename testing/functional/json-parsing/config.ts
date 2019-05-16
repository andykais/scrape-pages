import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  scrapers: {
    jsonInJs: {
      download: {
        urlTemplate: 'http://json-parsing.com/json-inside-js-response.js',
        regexCleanup: 'var api_read = '
      }
    },
    apiResponse: {
      download: 'http://json-parsing.com/api-response.json',
      parse: {
        format: 'json',
        selector: `posts[?(@.type=='post')].content`,
        regexCleanup: '\n$'
      }
    }
  },
  run: {
    scraper: 'apiResponse'
  }
}
