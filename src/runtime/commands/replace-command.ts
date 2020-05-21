import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import { TextReplaceCommand } from '@scrape-pages/types/instructions'

class ReplaceCommand extends BaseCommand<TextReplaceCommand, typeof ReplaceCommand.DEFAULT_PARAMS> {
  private static DEFAULT_PARAMS = {
    WITH: '',
    FLAGS: '',
  }
  private regex: RegExp

  // prettier-ignore
  public constructor(settings: Settings, tools: Tools, command: TextReplaceCommand) {
    super(settings, tools, command, ReplaceCommand.DEFAULT_PARAMS, 'REPLACE')

    const { SELECTOR, FLAGS } = command.params
    this.regex = new RegExp(SELECTOR, FLAGS)
  }

  public stream(payload: Stream.Payload) {
    const { WITH } = this.params
    const processedValue = payload.value.replace(this.regex, WITH)
    const newPayload = this.saveValue(payload, 0, processedValue)
    return Promise.resolve([newPayload])
  }

  public cleanup() {}
}

export { ReplaceCommand }
