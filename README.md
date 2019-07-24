<div align="center">

# scrape-pages
**generalized scraper using JSON based instructions**


A powerful scraper library focused on readability and reusability with tiny api footprint

<sub>
:warning: This project is under active development. Expect bugs and frequent api changes. If you wish to see progress, check out the 
<a href="https://github.com/andykais/scrape-pages/projects">github projects boards</a>
</sub>
<br/>
<br/>

[![npm](https://img.shields.io/npm/v/scrape-pages.svg)](https://www.npmjs.com/package/scrape-pages)
![node](https://img.shields.io/node/v/scrape-pages.svg?style=flat)
[![Travis Master Build Status](https://travis-ci.com/andykais/scrape-pages.svg?branch=master)](https://travis-ci.com/andykais/scrape-pages)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/andykais/scrape-pages/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/andykais/scrape-pages/badge.svg?branch=master)](https://coveralls.io/github/andykais/scrape-pages?branch=master)

<h3>
<a href="#documentation">Documentation</a>
|
<a href="https://scrape-pages.js.org">Playground</a>
</h3>


</div>


## Installation

```bash
npm install scrape-pages
```

## Usage

Lets download the ten most recent images from NASA's image of the day archive. First, define a `config`, `options`, and `params` to be passed into the scraper.

```javascript
const config = {
  // define some scrapers
  scrapers: {
    index: {
      download: 'https://apod.nasa.gov/apod/archivepix.html',
      parse: {
        selector: 'body > b > a',
        attribute: 'href'
        limit: 10
      },
    },
    post: {
      download: 'https://apod.nasa.gov/apod/{{ value }}',
      parse: {
        selector: 'img[src^="image"]',
        attribute: 'src'
      }
    },
    image: {
      download: 'https://apod.nasa.gov/apod/{{ value }}'
    }
  },
  // describe how they work together
  run: {
    scraper: 'index',
    forEach: {
      scraper: 'post',
      forEach: {
        scraper: 'image'
      }
    }
  }
}

const options = {
  logLevel: 'info',
  optionsEach: {
    image: {
      read: false,
      write: true
    }
  }
}
// params are separated from config & options so params can change while reusing configs & options.
const params = {
  folder: './downloads'
}
```

After declaring your settings, the usage of the library is very simple. There is a way to start the scraper, listen to events, emit events back to the scraper, and query the scraped data.

```javascript
const { scraper } = require('scrape-pages')

// create an executable scraper and a querier
const { start, query } = scrape(config, options, params)
// begin scraping here
const { on, emit } = await start()
// listen to events
on('image:compete', id => console.log('COMPLETED image', id))
on('done', () => {
  const result = query({ scrapers: ['images'] })
  // result = [[{ filename: 'img1.jpg' }, { filename: 'img2.jpg' }, ...]]
})
```

For more real world examples, visit the [examples](examples) directory

## Documentation

The scraper instance created from a config object is meant to be reusable and cached. It only knows about the config object. `scraper.run` can be called multiple times, and, as long as different folders are provided, each run will work independently. `scraper.run` returns **emitter**

### scrape

| argument | type          | required | type file                                                      | description                   |
| -------- | ------------- | -------- | -------------------------------------------------------------- | ----------------------------- |
| config   | `ConfigInit`  | Yes      | [src/settings/config/types.ts](src/settings/config/types.ts)   | _what_ is being downloaded    |
| options  | `OptionsInit` | Yes      | [src/settings/options/types.ts](src/settings/options/types.ts) | _how_ something is downloaded |
| params   | `ParamsInit`  | Yes      | [src/settings/params/types.ts](src/settings/params/types.ts)   | _who_ is being downloaded     |

### scraper

The `scrape` function returns a promise which yields these utilities (`on`, `emit`, and `query`)

#### on

Listen for events from the scraper

| event                  | callback arguments | description                                |
| ---------------------- | ------------------ | ------------------------------------------ |
| `'done'`               |                    | when the scraper has completed             |
| `'error'`              | Error              | if the scraper encounters an error         |
| `'<scraper>:progress'` | download id        | emits progress of download until completed |
| `'<scraper>:queued'`   | download id        | when a download is queued                  |
| `'<scraper>:complete'` | download id        | when a download is completed               |

#### emit

While the scraper is working, you can affect its behavior by emitting these events:

| event              | arguments | description                                                                                                                                                |
| ------------------ | --------- | ---------------------------------------------------------------------                                                                                      |
| `'useRateLimiter'` | boolean   | turn on or off the rate limit defined in the run options                                                                                                   |
| `'stop'`           |           | stop the crawler (note that in progress requests will still complete)                                                                                      |
| `'stop:<scraper>'` |           | stop a specific scraper from accepting new downloads. This is useful when you want to control how many downloads a more complex run structure should make. |

#### query

The query function allows you to get scraped data out of a progress whenever you want _after_ `start()` has been called. Note that `query()` is a convenience wrapper around `query.prepare()()`. Use the latter to achieve faster queries, as the former will re-build your sqlite statements each time it is called! These are its arguments:

| name       | type       | required | description                                                          |
| ---------- | ---------- | -------- | -------------------------------------------------------------------- |
| `scrapers` | `string[]` | Yes      | scrapers who will return their filenames and parsed values, in order |
| `groupBy`  | `string`   | Yes      | name of a scraper which will delineate the values in `scrapers`      |

## Motivation

The pattern to download data from a website is largely similar. It can be summed up like so:

- get a page from a url
  - scrape the page for more urls
    - get a page
      - get some text or media from page

What varies is how much nested url grabbing is required and in which steps data is saved.
This project is an attempt to generalize that process into a single static config file.

Describing a site crawler with a single config enforces structure, and familiarity that is less common with
other scraping libraries. Not only does this make yours surface api much more condensed, and immediately
recognizable, it also opens the door to sharing and collaboration, since passing json objects around the web
is safer than executable code.
Hopefully, this means that users can agree on common configs for different sites, and in time, begin to contribute common scraping patterns.

Generally, if you could scrape the page without executing javascript in a headless browser,
this package should be able to scrape what you wish. However, it is important to note that if you are doing high volume production level scraping, it is always better to write
your own scraper code.
