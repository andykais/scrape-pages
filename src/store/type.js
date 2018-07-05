// keep track of each scraper
// so it can recover if there is a failure
//
// writing to a json file in the toplevel download folder
// algo for write queueing: write every 1 second or every 10 changes

type Url = string
type Filepath = string

type UrlScraper = {
  in_progress: Array<Url>,
  folder: string,
  downloaded: Array<Filepath>
}

export type Store = {}
