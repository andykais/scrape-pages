# scrape-pages

[![Travis Master Build Status](https://travis-ci.com/andykais/scrape-pages.svg?branch=master)](https://travis-ci.com/andykais/scrape-pages)
[![npm](https://img.shields.io/npm/v/scrape-pages.svg)](https://www.npmjs.com/package/scrape-pages)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/andykais/scrape-pages/blob/master/LICENSE)

This package scrapes sites for text and files based on a single config file representing the crawler's flow.

:warning: This project is under active development. Expect bugs and frequent api changes. If you wish to see
progress, check out the [github projects boards](https://github.com/andykais/scrape-pages/projects)

## Installation

```bash
npm install scrape-pages
```

## Usage

lets download the five most recent images from nasa's image of the day archive

```javascript
const ScrapePages = require('scrape-pages')
// create a config file
const config = {
  scrape: {
    download: 'https://apod.nasa.gov/apod/archivepix.html',
    parse: {
      selector: 'body > b > a:nth-child(-n+10)',
      attribute: 'href'
    },
    scrapeEach: {
      download: 'https://apod.nasa.gov/apod/{value}',
      parse: {
        selector: 'a[href^="image"]',
        attribute: 'href'
      },
      scrapeEach: {
        name: 'image',
        download: 'https://apod.nasa.gov/apod/{value}'
      }
    }
  }
}

// load the config into a new 'scraper'
const siteScraper = new ScrapePages(config)
// begin scraping
const emitter = siteScraper.run({ folder: './downloads' })

emitter.on('image:complete', (queryFor, { id }) =>
  console.log('COMPLETED image', id)
)

emitter.on('done', async queryFor => {
  console.log('finished.')
  const result = await queryFor({ scrapers: { images: ['filename'] } })
  console.log(result)
  // [{
  //   images: [{ filename: 'img1.jpg' }, { filename: 'img2.jpg' }, ...]
  // }]
})
```

For more real world examples, visit the [examples](examples) directory

## Documentation

Detailed usage documentation is coming, but for now, [typescript](https://www.typescriptlang.org/) typings
exist for the surface API.

- for scraper config object documentation see [src/configuration/types.ts](src/configuration/types.ts)
- for runtime options documentation see [src/run-options/types.ts](src/run-options/types.ts)

The scraper instance created from a config object is meant to be reusable and cached. It only knows about the
config object. `scraper.run` can be called multiple times, and, as long as different folders are
provided, each run will work independently. `scraper.run` returns **emitter**

### emitter

#### Listenable events

each event will return the **queryFor** function as its first argument

- `'done'`: when the scraper has completed
- `'error'`: when the scraper encounters an error (this also stops the scraper)
- `'<scraper>:progress'`: emits progress of download until completed
- `'<scraper>:queued'`: when a download is queued
- `'<scraper>:complete'`: when a download is completed

#### Emittable events

- '`useRateLimiter'`: pass a boolean to turn on or off the rate limit defined in the run options
- `'stop'`: emit this event to stop the crawler (note that any in progress promises will still complete)

### queryFor

This function is used to get data back out of the scraper whenever you need it. The function takes an object
with three keys:

- `scrapers`: `{ [name]: Array<'filename'|'parsedValue'> }`
- `groupBy?`: name of a scraper which will delineate the values in `scrapers`
- `stmtCacheKey?`: `Symbol` which helps the internal database cache queries.

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
