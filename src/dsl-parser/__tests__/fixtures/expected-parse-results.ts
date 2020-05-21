import { Instructions } from '@scrape-pages/types/instructions'
const syntaxCoverageInstruction: Instructions = {
  inputs: ['hi'],
  program: [
    {
      operator: 'init',
      commands: [
        {
          command: 'FETCH',
          params: { METHOD: 'GET', URL: 'https://google.com', WRITE: true },
        },
        {
          command: 'FETCH',
          params: {
            URL: 'https://wikipedia.com',
            WRITE: true,
            READ: true,
          },
        },
        {
          command: 'PARSE',
          params: { SELECTOR: 'span > a', ATTR: 'href', MAX: 10, LABEL: 'test' },
        },
      ],
    },
    { operator: 'until', expression: '{{value}} == x || ({{index}} <= 2)' },
    { operator: 'map', commands: [] },
    {
      operator: 'merge',
      programs: [
        [
          {
            operator: 'init',
            commands: [
              {
                command: 'FETCH',
                params: { METHOD: 'PUT', URL: 'me' },
              },
              {
                command: 'FETCH',
                params: { URL: 'me' },
              },
            ],
          },
          {
            operator: 'map',
            commands: [
              {
                command: 'FETCH',
                params: { URL: 'you' },
              },
            ],
          },
        ],
      ],
    },
  ],
}

export { syntaxCoverageInstruction }
