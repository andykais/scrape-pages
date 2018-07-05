const makeWaitingConditionalJoins = (flatConfig, levels) => {
  levels.sort((a, b) => b.depth - a.depth)
  const lowestDepth = levels[0].depth
  const levelsThatWillWait = levels.filter(l => l.depth !== lowestDepth)

  // console.log(lowestDepth)
  // console.log(levels)
  // console.log(levelsThatWillWait)
  const caseJoins = levelsThatWillWait
    .map(level => {
      const waitingSteps = Array(lowestDepth - level.depth)
        .fill(level.depth)
        .map((d, i) => lowestDepth - d + i - 1)
        .map(recurseDepth => `'${recurseDepth}'`)
        .join(',')

      return `WHEN cte.startLevel = '${
        level.name
      }' AND cte.recurseDepth IN (${waitingSteps}) THEN cte.id`
    })
    .join(' ')
  if (caseJoins) return `CASE ${caseJoins} ELSE cte.parentId END`
  else return 'cte.parentId'
}

export { makeWaitingConditionalJoins }
