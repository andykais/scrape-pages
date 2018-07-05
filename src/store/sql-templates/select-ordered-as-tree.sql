WITH cte AS (
  SELECT
    parsedTree.id,
    url,
    parentId,
    parseIndex,
    incrementIndex,
    0 as recurseDepth,
    parsedTree.scraper,
    parsedTree.scraper AS currentScraper,
    0 as levelOrder
  FROM parsedTree INNER JOIN downloads ON parsedTree.downloadId = downloads.id
  WHERE parsedTree.scraper in ({selectedScrapers})
  UNION ALL
  SELECT
    pTree.id,
    cte.url,
    pTree.parentId,
    pTree.parseIndex,
    pDownloads.incrementIndex,
    cte.recurseDepth + 1,
    cte.scraper,
    pTree.scraper AS currentScraper,
    {orderLevelColumnSql} AS levelOrder
  FROM cte
  INNER JOIN parsedTree as pTree ON
  {waitingJoinsSql} = pTree.id
  INNER JOIN downloads as pDownloads ON
  pTree.downloadId = pDownloads.id
  ORDER BY
  recurseDepth,
  parseIndex, incrementIndex,
  levelOrder
)
SELECT id, url, parentId, parseIndex, incrementIndex, recurseDepth, currentScraper, scraper, levelOrder
FROM cte
WHERE parentId IS NULL;
