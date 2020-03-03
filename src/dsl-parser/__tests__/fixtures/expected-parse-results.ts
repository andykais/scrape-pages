import { Instructions } from 'scrape-pages/types/instructions'
const syntaxCoverageInstruction: Instructions = {
  inputs: ['hi'],
  program: [
    {
      operator: 'init',
      commands: [
        {
          command: 'REQUEST',
          params: { method: 'GET', url: 'https://google.com', WRITE: true }
        },
        {
          command: 'REQUEST',
          params: {
            method: 'GET',
            url: 'https://wikipedia.com',
            WRITE: true,
            READ: true
          }
        },
        {
          command: 'PARSE',
          params: { selector: 'span > a', ATTR: 'href', MAX: 10 }
        },
        { command: 'TAG', params: { tagSlug: 'test' } }
      ]
    },
    { operator: 'until', expression: '{{value}} == x || ({{index}} <= 2)' },
    {
      operator: 'map',
      commands: [{ command: 'TAG', params: { tagSlug: 'nother' } }]
    },
    {
      operator: 'branch',
      programs: [
        [
          {
            operator: 'init',
            commands: [
              {
                command: 'REQUEST',
                params: { method: 'GET', url: 'me' }
              },
              {
                command: 'REQUEST',
                params: { method: 'GET', url: 'me' }
              }
            ]
          },
          {
            operator: 'map',
            commands: [
              {
                command: 'REQUEST',
                params: { method: 'GET', url: 'you' }
              }
            ]
          }
        ],
        [
          {
            operator: 'init',
            commands: [{ command: 'TAG', params: { tagSlug: 'ne' } }]
          }
        ]
      ]
    }
  ]
}

export { syntaxCoverageInstruction  }
