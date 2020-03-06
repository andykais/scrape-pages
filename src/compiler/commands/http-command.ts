import { BaseCommand } from './base-command'
// type imports
import { Stream } from '@scrape-pages/types/internal'

class HttpCommand extends BaseCommand {

  stream(payload: Stream.Payload) {
    return []
  }
}

export { HttpCommand }
