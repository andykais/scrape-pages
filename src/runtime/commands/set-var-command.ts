import { BaseCommand } from './base-command'
// type imports
import { Settings, Tools, Stream } from '@scrape-pages/types/internal'
import * as I from '@scrape-pages/types/instructions'

class SetVarCommand extends BaseCommand<I.SetVarCommand, typeof SetVarCommand.DEFAULT_PARAMS> {
  public static DEFAULT_PARAMS = {
    WITH: '',
    FLAGS: '',
  }

  // prettier-ignore
  public constructor(settings: Settings, tools: Tools, command: I.SetVarCommand) {
    super(settings, tools, command, SetVarCommand.DEFAULT_PARAMS, 'SET')
  }

  public stream(payload: Stream.Payload) {
    const { VAR_NAME } = this.params
    const payloadWithSetVar = payload.setIn(['userSetVars'], {
      ...payload.userSetVars,
      [VAR_NAME]: payload.value,
    })
    // TODO for now we are saving this value just because its easier on the sorting algo.
    // its unecessary though so we should make it a pure side effect at some point (or use an operator?)
    const newPayload = this.saveValue(payloadWithSetVar, 0, payloadWithSetVar.value)
    return Promise.resolve([newPayload])
  }

  public cleanup() {}
}

export { SetVarCommand }
