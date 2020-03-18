// type imports
import { ScraperProgram } from '@scrape-pages'
import { Tools } from '@scrape-pages/types/internal'

const queryExecutionDebugger = (scraper: ScraperProgram) => (scrapers: string[]) => {
  const store: Tools['store'] = (scraper as any).runtime.tools.store

  // store.qs.selectOrderedLabeledValues and pass in the debug flag
  // do some readline stuff
}
