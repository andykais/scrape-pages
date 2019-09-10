import { ConfigInit } from '../../../src/settings/config/types'

export const config: ConfigInit = {
  flow: [
    {
      name: 'apiResponse',
      download: 'http://json-parsing.com/api-response.json',
      parse: {
        format: 'json',
        selector: `posts[type='post'].content`,
        regexCleanup: '\n$'
      }
    }
  ]
}

export const configParseJsonTwice: ConfigInit = {
  flow: [
    {
      name: 'parsePosts',
      download: 'http://json-parsing.com/api-response.json',
      parse: {
        format: 'json',
        selector: `posts[type='post']`
      }
    },
    {
      name: 'parseContentFromPost',
      parse: {
        format: 'json',
        selector: 'content',
        regexCleanup: '\n$'
      }
    }
  ]
}

export const configParseJsonInsideScript: ConfigInit = {
  flow: [
    {
      name: 'jsonInJs',
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
        selector: 'a.nested.story[].word'
      }
    }
  ]
}
