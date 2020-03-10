import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

class ParseCommand extends BaseCommand {
  constructor(settings: Settings, tools: Tools, command: I.ParseCommand) {
    super(settings, tools, command)
  }

  stream(payload: Stream.Payload) {
    return []
  }

  async initialize() {}
  async cleanup() {}
}

export { ParseCommand }
