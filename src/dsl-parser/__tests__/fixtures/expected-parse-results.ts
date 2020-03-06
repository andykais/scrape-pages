import { Instructions } from '@scrape-pages/types/instructions'
const syntaxCoverageInstruction: Instructions = {
  inputs: ['hi'],
  program: [
    {
      operator: 'init',
      commands: [
        {
          command: 'HTTP',
          params: { METHOD: 'GET', URL: 'https://google.com', WRITE: true }
        },
        {
          command: 'HTTP',
          params: {
            URL: 'https://wikipedia.com',
            WRITE: true,
            READ: true
          }
        },
        {
          command: 'PARSE',
          params: { SELECTOR: 'span > a', ATTR: 'href', MAX: 10 }
        },
        { command: 'TAG', params: { SLUG: 'test' } }
      ]
    },
    { operator: 'until', expression: '{{value}} == x || ({{index}} <= 2)' },
    {
      operator: 'map',
      commands: [{ command: 'TAG', params: { SLUG: 'nother' } }]
    },
    {
      operator: 'branch',
      programs: [
        [
          {
            operator: 'init',
            commands: [
              {
                command: 'HTTP',
                params: { METHOD: 'PUT', URL: 'me' }
              },
              {
                command: 'HTTP',
                params: { URL: 'me' }
              }
            ]
          },
          {
            operator: 'map',
            commands: [
              {
                command: 'HTTP',
                params: { URL: 'you' }
              }
            ]
          }
        ],
        [
          {
            operator: 'init',
            commands: [{ command: 'TAG', params: { SLUG: 'ne' } }]
          }
        ]
      ]
    }
  ]
}

export { syntaxCoverageInstruction  }
