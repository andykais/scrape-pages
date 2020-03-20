import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import { TextReplaceCommand } from '@scrape-pages/types/instructions'

class ReplaceCommand extends BaseCommand<TextReplaceCommand, typeof ReplaceCommand.DEFAULT_PARAMS> {
  private static DEFAULT_PARAMS = {
    WITH: ''
  }
  constructor(settings: Settings, tools: Tools, command: TextReplaceCommand) {
    super(settings, tools, command, ReplaceCommand.DEFAULT_PARAMS)
  }

  stream(payload: Stream.Payload) {
    throw new Error('unimplemented')
    return Promise.resolve([])
  }

  async initialize() {}
  async cleanup() {}
}

export { ReplaceCommand }
