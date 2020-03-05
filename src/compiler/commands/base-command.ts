import { Settings, Tools, StoredValue } from 'scrape-pages/types/internal'

abstract class BaseCommand {
  constructor(private settings: Settings, private tools: Tools) {}

  abstract stream(value: StoredValue): string[]
}

export { BaseCommand }
