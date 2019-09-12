// type imports
import { FlatConfig } from '../../../settings/config/types'

const makeWaitingConditionalJoins = (flatConfig: FlatConfig, scraperNames: string[]) => {
  const levels = scraperNames
    .map(name => flatConfig.getOrThrow(name))
    .sort((a, b) => b.depth - a.depth)
  const lowestDepth = levels[0].depth
  const levelsThatWillWait = levels.filter(l => l.depth !== lowestDepth)

  const caseJoins = levelsThatWillWait
    .map(level => {
      const waitingSteps = Array(lowestDepth - level.depth)
        .fill(null)
        .map((_, recurseDepth) => recurseDepth)
        .join(',')

      return `WHEN cte.scraper = '${level.name}' AND cte.recurseDepth IN (${waitingSteps}) THEN cte.id`
    })
    .join(' ')
  if (caseJoins) return `CASE ${caseJoins} ELSE cte.parentId END`
  else return 'cte.parentId'
}

export { makeWaitingConditionalJoins }
