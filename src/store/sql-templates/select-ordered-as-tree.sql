WITH cte AS (
  SELECT
    parsedTree.id,
    url,
    parsedValue,
    parentId,
    parseIndex,
    incrementIndex,
    0 as recurseDepth,
    parsedTree.scraper,
    parsedTree.scraper AS currentScraper,
    {orderLevelColumnSql} as levelOrder
  FROM parsedTree INNER JOIN downloads ON parsedTree.downloadId = downloads.id
  WHERE parsedTree.scraper in ({selectedScrapers})
  UNION ALL
  SELECT
    pTree.id,
    cte.url,
    cte.parsedValue,
    pTree.parentId,
    pTree.parseIndex,
    pDownloads.incrementIndex,
    cte.recurseDepth + 1,
    cte.scraper,
    pTree.scraper AS currentScraper,
    cte.levelOrder
  FROM cte
  INNER JOIN parsedTree as pTree ON
  {waitingJoinsSql} = pTree.id
  INNER JOIN downloads as pDownloads ON
  pTree.downloadId = pDownloads.id
  ORDER BY
  recurseDepth,
  parseIndex,
  incrementIndex,
  levelOrder
)
SELECT id, url, parsedValue, parentId, parseIndex, incrementIndex, recurseDepth, currentScraper, scraper, levelOrder
FROM cte
WHERE recurseDepth = {lowestDepth}
ORDER BY
  recurseDepth,
  incrementIndex,
  parseIndex,
  levelOrder
;
