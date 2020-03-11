import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

// TODO queues and cache:
// when cache is enabled
// check for matching in-flight request
// if none, check for matching request in database
// if none, add it to the queue
class FetchCommand extends BaseCommand {

  constructor(settings: Settings, tools: Tools, command: I.HttpCommand) {
    super(settings, tools, command)
  }

  stream(payload: Stream.Payload) {
    return []
  }

  async initialize() {}
  async cleanup() {
    // cancel in-flight requests here
  }
}

export { FetchCommand }
