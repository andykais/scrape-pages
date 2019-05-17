import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  scrapers: {
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

export const configParseJsonTwice: ConfigInit = {
  scrapers: {
    parsePosts: {
      download: 'http://json-parsing.com/api-response.json',
      parse: {
        format: 'json',
        selector: `posts[?(@.type=='post')]`
      }
    },
    parseContentFromPost: {
      parse: {
        format: 'json',
        selector: 'content',
        regexCleanup: '\n$'
      }
    }
  },
  run: {
    scraper: 'parsePosts',
    forEach: {
      scraper: 'parseContentFromPost'
    }
  }
}

export const configParseJsonInsideScript: ConfigInit = {
  scrapers: {
    jsonInJs: {
      download: {
        urlTemplate: 'http://json-parsing.com/json-inside-js-response.js.txt',
        regexCleanup: {
          selector: 'var api_read = (.*);',
          replacer: '$1',
          flags: 's'
        }
      },
      parse: {
        format: 'json',
        selector: 'a.nested.story[*].word'
      }
    }
  },
  run: {
    scraper: 'jsonInJs'
  }
}
