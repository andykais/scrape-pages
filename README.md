<div align="center">

# scrape-pages

A generalized scraper library using JSON based instructions.
It focuses on readability and reusability with a tiny api footprint.

[![npm](https://img.shields.io/npm/v/scrape-pages.svg)](https://www.npmjs.com/package/scrape-pages)
![node](https://img.shields.io/node/v/scrape-pages.svg?style=flat)
[![Github Actions Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fandykais%2Fscrape-pages%2Fbadge&label=build)](https://actions-badge.atrox.dev/andykais/scrape-pages/goto)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/andykais/scrape-pages/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/andykais/scrape-pages/badge.svg?branch=master)](https://coveralls.io/github/andykais/scrape-pages?branch=master)

<sub>
:warning: This project is under active development. Expect bugs and frequent api changes.

See the  <a href="https://github.com/andykais/scrape-pages/projects">github issues page</a> for an overview of ongoing work.
</sub>
</div>

## Installation

```bash
npm install scrape-pages
```

## Usage

Lets download the ten most recent images from NASA's image of the day archive.

```javascript
// First, define a `config`, `options`, and `params` to be passed into the scraper.
const config = {
  flow: [
    {
      name: 'index',
      download: 'https://apod.nasa.gov/apod/archivepix.html',
      parse: {
        selector: 'body > b > a',
        attribute: 'href'
        limit: 10
      },
    },
    {
      name: 'post',
      download: 'https://apod.nasa.gov/apod/{{ value }}',
      parse: {
        selector: 'img[src^="image"]',
        attribute: 'src'
      }
    },
    {
      name: 'image',
      download: 'https://apod.nasa.gov/apod/{{ value }}'
    }
  ]
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

// Outside of defining configuration objects, the api is very simple. You have the ability to:
// - start the scraper
// - listen for events from the scraper
// - emit events back to the scraper (like 'stop')
// - query the scraped data

const scraper = new ScraperProgram(config, options, params)
scraper
  .on('image:complete', id => console.log('COMPLETED image', id))
  .on('done', () => {
    const result = scraper.query(['images'])
    // result is [[{ filename: 'img1.jpg' }, { filename: 'img2.jpg' }, ...]]
  })
  .start()
```

For more real world examples, visit the [examples](examples) directory

## Playground
A playground exists at https://scrape-pages.js.org to help visualize scraper flows. It is also a useful way to
share a `config` object with others.

## Documentation

The compiled scraper created from a `config` object is meant to be reusable. You may choose to tweak the cache
settings on the `options` object to run the scraper multiple times and only re-download certain parts. If
given a different output folder in the `params` object, it will run completely fresh.

### scrape

| argument | type          | type file                                                      | description                                  |
| -------- | ------------- | -------------------------------------------------------------- | -----------------------------                |
| config   | `ConfigInit`  | [src/settings/config/types.ts](src/settings/config/types.ts)   | Pages that are being downloaded & parsed |
| options  | `OptionsInit` | [src/settings/options/types.ts](src/settings/options/types.ts) | Knobs to tweak download behavior
| params   | `ParamsInit`  | [src/settings/params/types.ts](src/settings/params/types.ts)   | Inputs values and output file locations

### scraper

The `scrape` function returns a promise which yields these utilities (`on`, `emit`, and `query`)

#### on

Listen for events from the scraper

| event                  | callback arguments | description                                                    |
| ---------------------- | ------------------ | ------------------------------------------                     |
| `'initialized'`        |                    | after start(), `initialized` means scraper has begun  scraping |
| `'done'`               |                    | when the scraper has completed                                 |
| `'error'`              | Error              | if the scraper encounters an error                             |
| `'<scraper>:progress'` | download id        | emits progress of download until completed                     |
| `'<scraper>:queued'`   | download id        | when a download is queued                                      |
| `'<scraper>:complete'` | download id        | when a download is completed                                   |

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

