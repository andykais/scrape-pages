import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

class ReplaceCommand extends BaseCommand {
  constructor(settings: Settings, tools: Tools, command: I.TextReplaceCommand) {
    super(settings, tools, command)
  }

  stream(payload: Stream.Payload) {
    return []
  }

  async initialize() {}
  async cleanup() {}
}

export { ReplaceCommand }
