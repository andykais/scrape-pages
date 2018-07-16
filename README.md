# scrape-pages

[![Travis branch](https://img.shields.io/travis/andykais/scrape-pages/master.svg)](https://travis-ci.com/andykais/scrape-pages/branches)
![license](https://img.shields.io/github/license/andykais/scrape-pages.svg)

This package scrapes sites for text and files based on a single config file representing the crawler's flow.

:warning: This project is under active development. Expect bugs and frequent api changes.

## Installation

```bash
# NOT AVAILABLE YET
npm install scrape-pages
```

## Usage

lets download the five most recent images from nasa's image of the day archive

```javascript
const ScrapePages = require('scrape-pages')
// create a config file
const iotd = {
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
        download: 'https://apod.nasa.gov/apod/{value}'
      }
    }
  }
}
// load the config into a new 'scraper'
const siteScraper = new PageScraper(config)

// begin scraping
const { emitter, queryFor } = siteScraper.run({ folder: './downloads' })

emitter.on('done', () => {
  console.log('finished downloading.')
  queryFor({ scrapers: { images: ['filename'] } }).then(images => {
    console.log(images)
    // [{
    //   images: [{ filename: 'img1.jpg' }, { filename: 'img2.jpg' }, ...]
    // }]
  })
})
```

For more real world examples, visit the [examples](examples) directory

## Documentation

For now, the flow typings for the surface api are the only documentation that exist.

- for config object documentation see the [config flow file](src/configuration/type.js)
- for runtime options documentation see the [run options flow file](src/run-options/type.js)

The scraper instance created from a config object is meant to be reusable and cached. It only knows about the
config object. `scraper.run` can be called multiple times, and, as long as different folders are
provided, each run will work independently. `scraper.run` returns **emitter** and **queryFor**

#### emitter

standard event emitter which emits several events

- `'done'`: when the scraper has completed
- `'error'`: when the scraper encounters an error (this also stops the scraper)
- `'<scraper>:progress'`: emits progress of download until completed
- `'<scraper>:queued'`: when a download is queued
- `'<scraper>:complete'`: when a download is completed

#### queryFor

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
Generally, if you could scrape the page without executing javascript in a headless browser,
this package should be able to scrape what you wish. However, it is important to note that if you are doing high volume production level scraping, it is always better to write
your own scraper code.
