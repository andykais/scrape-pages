import * as path from 'path'

import './use-chai-plugins'
import 'mocha-steps'

export { NockFolderMock } from './nock-folder-mock'
export { rxjsTestScheduler } from './rxjs-test-scheduler'
// export { stripResult } from './snapshots'
//export { configureSnapshots, stripResult } from './configure-snapshots'
export { useRequestStatsRecorder } from './scraper-stats-trackers'

export const RUN_OUTPUT_FOLDER = path.resolve(__dirname, 'functional', '.run-output')
