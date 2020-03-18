import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

class ReplaceCommand extends BaseCommand<I.TextReplaceCommand, typeof ReplaceCommand.DEFAULT_PARAMS> {
  private static DEFAULT_PARAMS = {
    WITH: ''
  }
  constructor(settings: Settings, tools: Tools, command: I.TextReplaceCommand) {
    super(settings, tools, command, ReplaceCommand.DEFAULT_PARAMS)
  }

  stream(payload: Stream.Payload) {
    return Promise.resolve([])
  }

  async initialize() {}
  async cleanup() {}
}

export { ReplaceCommand }
