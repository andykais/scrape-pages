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
// Define some instructions for the scraper:
const instructions = `
(
  FETCH 'https://apod.nasa.gov/apod/archivepix.html' LABEL='index'
  PARSE 'body > b > a' ATTR='href' MAX=10
  # values are passed in a stream, so whatever previous value(s) were parsed above, are each passed below
  FETCH 'https://apod.nasa.gov/apod/{{ value }}'
  PARSE 'img[src^="image"]' ATTR='src'
  FETCH 'https://apod.nasa.gov/apod/{{ value }}' READ=false WRITE=true LABEL='image'
)`
const folder = './downloads'
const options = {}

/**
 * Outside of defining configuration objects, the api is very simple. You have the ability to:
 * - start (and restart) the scraper
 * - listen for events from the scraper
 * - stop the scraper, or any labeled command
 * - query the scraped data
 */
const scraper = new ScraperProgram(instructions, folder, options)
scraper.on('image:saved', ({ id }) => console.log('saved image', id))
await scraper.start().toPromise()

const result = scraper.query(['image'])
// result is [[{ filename: 'img1.jpg' }, { filename: 'img2.jpg' }, ...]]
```

For more real world examples, visit the [examples](examples) directory

## Playground
A playground exists at https://scrape-pages.js.org to help visualize scraper flows. It is also a useful way to
share a `config` object with others.

## Documentation

The ScraperProgram class is meant to create a compiled, reusable, web scraper. It is backed by a sqlite
database and observables under the hood. Each time the scraper is started, it wipes previous values from the
database, except for the [cache](#cache). If the folder provided is empty, it will run completely fresh.

Read the API docs [here](). Below, important concepts are outlined:
- [Instructions](#instructions)
- [events](#events)
- [query](#query)
- [cache](#cache)
- [rate limiting](#rate-limiting)

### Instructions
### events
The scraper class extends the nodejs's `EventEmitter`, so you have all the same methods available.

| event                  | callback arguments | description                                                    |
| ---------------------- | ------------------ | ------------------------------------------                     |
| `'initialized'`        |                    | after start(), `initialized` means scraper has begun scraping |
| `'done'`               |                    | when the scraper has completed                                 |
| `'error'`              | Error              | if the scraper encounters an error                             |
| `'<scraper>:progress'` | download id        | emits progress of download until completed                     |
| `'<scraper>:queued'`   | download id        | when a download is queued                                      |
| `'<scraper>:saved'`    | download id        | when a download is completed                                   |
### query
The `query` function grabs saved values from the database. It can be called so long as the `'initialized'` event has fired. Note that `scraper.query()` is a convenience wrapper around `scraper.query.prepare()()` use the latter to achieve faster queries, as the former will rebuild sqlite statements each time it is called. View its [API docs]()

### cache
### rate limiting


### scrape

| argument | type          | type file                                                      | description                                  |
| -------- | ------------- | -------------------------------------------------------------- | -----------------------------                |
| config   | `configinit`  | [src/settings/config/types.ts](src/settings/config/types.ts)   | pages that are being downloaded & parsed |
| options  | `optionsinit` | [src/settings/options/types.ts](src/settings/options/types.ts) | knobs to tweak download behavior
| params   | `paramsinit`  | [src/settings/params/types.ts](src/settings/params/types.ts)   | inputs values and output file locations

## motivation

the pattern to download data from a website is largely similar. it can be summed up like so:

- get a page from a url
  - scrape the page for more urls
    - get a page
      - get some text or media from page

what varies is how much nested url grabbing is required and in which steps data is saved.
this project is an attempt to generalize that process into a single static config file.

describing a site crawler with a single config enforces structure, and familiarity that is less common with
other scraping libraries. not only does this make yours surface api much more condensed, and immediately
recognizable, it also opens the door to sharing and collaboration, since passing json objects around the web
is safer than executable code.
hopefully, this means that users can agree on common configs for different sites, and in time, begin to contribute common scraping patterns.

generally, if you could scrape the page without executing javascript in a headless browser,
this package should be able to scrape what you wish. however, it is important to note that if you are doing high volume production level scraping, it is always better to write
your own scraper code.

