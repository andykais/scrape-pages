import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

class ParseCommand extends BaseCommand<I.ParseCommand, typeof ParseCommand.PARAM_DEFAULTS> {
  private static PARAM_DEFAULTS = {
    FORMAT: 'html' as 'html',
    ATTR: undefined,
    MAX: undefined
  }

  constructor(settings: Settings, tools: Tools, command: I.ParseCommand) {
    super(settings, tools, command, ParseCommand.PARAM_DEFAULTS)
  }

  stream(payload: Stream.Payload) {
    return Promise.resolve([])
  }

  async initialize() {}
  async cleanup() {}
}

export { ParseCommand }
