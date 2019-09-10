import { FMap } from '../../util/map'
// type imports
import { Config, ConfigPositionInfo, FlatConfig } from './types'

const flattenConfig = (config: Config): FlatConfig => {
  const recurse = (
    flow: Config['flow'],
    parentName?: string,
    depth = 0,
    horizontalIndex = 0
  ): FlatConfig =>
    flow
      .map((flowStep, index) => {
        const { name } = flowStep.scrape

        const branchFlatConfigs = flowStep.branch
          .map((flow, horizontalIndexInner) =>
            recurse(flow, name, depth + index + 1, horizontalIndex + horizontalIndexInner)
          )
          .reduce((mapAcc, configPositionInfo) => mapAcc.merge(configPositionInfo), new FMap())

        const recurseFlatConfigs = flowStep.recurse
          .map((flow, horizontalIndexInner) =>
            recurse(flow, name, depth + index + 1, horizontalIndex + horizontalIndexInner)
          )
          .reduce((mapAcc, configPositionInfo) => mapAcc.merge(configPositionInfo), new FMap())

        return new FMap<string, ConfigPositionInfo>()
          .set(name, {
            name,
            parentName: index ? flow[index - 1].scrape.name : parentName,
            depth: depth + index,
            horizontalIndex: index ? 0 : horizontalIndex // TODO find out if horizontal indexes should be preserved
          })
          .merge(branchFlatConfigs)
          .merge(recurseFlatConfigs)
      })
      .reduce((mapAcc, configPositionInfo) => mapAcc.merge(configPositionInfo), new FMap())

  return recurse(config.flow)
}

export { flattenConfig }
