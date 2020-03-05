import { BaseCommand } from './base-command'
// type imports
import { StoredValue } from 'scrape-pages/types/internal'

class HttpCommand extends BaseCommand {

  stream(value: StoredValue) {
    return []
  }
}

export { HttpCommand }
