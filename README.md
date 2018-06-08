# scrape-pages

This package scrapes sites based on a config object. To understand how to use it, take a look at the config
[flow type](./src/configuration/type.js) and example config files in the [tests](tests/) directory.

## Installation

```bash
# NOT AVAILABLE ON NPM YET
npm install scrape-pages
```

## Usage

```javascript
const PageScraper = require('scrape-pages')
// create a config file
const nasaImageOfTheDayConfig = {
  scrape: {
    build_url: {
      url_template: 'https://www.nasa.gov/multimedia/imagegallery/iotd.html'
    },
    for_each: {
      criteria: {
        selector: '.gallery-card img',
        attribute: 'src'
      }
    }
  }
}

const siteScraper = new PageScraper(config, { downloadDir: './images' })

// events === ['save', 'done'], you can name scraper steps and they will show up here
const { events } = siteScraper
const eventEmitter = siteScraper.run()

eventEmitter.on('save', ({ filename, index, meta }) =>
  console.log(`saved ${filename}, download number ${index} out of ${meta.queued.unnamed}`)
)
eventEmitter.on('done', () => console.log('finished downloading.'))
```

## Motivation

The pattern to download data from a website is largely similar. It can be summed up like so:

- get a page from a url
  - scrape the page for more urls
    - get a page
      - get some text or media from page

What varies is how much nested url grabbing is required and in which steps data is saved.
This project is an attempt to generalize that process into a single static config file.
Generally, if you could scrape the page without executing javascript in a headless browser,
this package should be able to scrape what you wish.
