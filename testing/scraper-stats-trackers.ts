import { EventEmitter } from 'events'
import { ConfigInit } from '../src/settings/config/types'
import { normalizeConfig, flattenConfig } from '../src/settings/config'

const useRequestStatsRecorder = (config: ConfigInit, emitter: EventEmitter) => {
  const flatConfig = flattenConfig(normalizeConfig(config))
  const scraperNames = Array.from(flatConfig.keys())
  const counts = scraperNames.reduce(
    (acc, scraperName) => {
      acc[scraperName] = { queued: 0, complete: 0 }
      return acc
    },
    {} as {
      [scraperName: string]: { queued: number; complete: number }
    }
  )
  const stats = { counts, maxConcurrentRequests: 0 }
  const concurrentRequests = new Set()
  for (const scraperName of scraperNames) {
    emitter.on(`${scraperName}:queued`, () => {
      stats.counts[scraperName].queued++
    })
    emitter.on(`${scraperName}:complete`, id => {
      stats.counts[scraperName].complete++
      concurrentRequests.delete(id)
    })
    emitter.on(`${scraperName}:progress`, id => {
      concurrentRequests.add(id)
      stats.maxConcurrentRequests = Math.max(stats.maxConcurrentRequests, concurrentRequests.size)
    })
  }
  return stats
}

export { useRequestStatsRecorder }
