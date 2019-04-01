WITH cte AS (
  SELECT
    parsedTree.id,
    downloads.id as downloadId,
    downloads.cacheId,
    downloads.complete,
    parsedValue,
    parentId,
    parseIndex,
    incrementIndex,
    0 as recurseDepth,
    parsedTree.scraper,
    parsedTree.scraper AS currentScraper,
    0 as levelOrder
  FROM downloads
  LEFT JOIN parsedTree ON parsedTree.downloadId = downloads.id
  WHERE downloads.scraper in ({{{ selectedScrapers }}})
  UNION ALL
  SELECT
    pTree.id,
    cte.downloadId,
    cte.cacheId,
    cte.complete,
    cte.parsedValue,
    pTree.parentId,
    pTree.parseIndex,
    pDownloads.incrementIndex,
    cte.recurseDepth + 1,
    cte.scraper,
    pTree.scraper AS currentScraper,
    {{{orderLevelColumnSql}}} as levelOrder
  FROM cte
  INNER JOIN parsedTree as pTree
  ON {{{ waitingJoinsSql }}} = pTree.id
  INNER JOIN downloads as pDownloads
  ON pTree.downloadId = pDownloads.id
  ORDER BY
  recurseDepth, -- recurseDepth ensures that we move from the bottom of the tree to the top
  parseIndex, -- parseIndex orders by appearance on html/json
  incrementIndex, -- incrementIndex handles `incrementUntil`
  levelOrder, -- see make-dynamic-order-level-column.ts
  parentId -- parentId handles `scrapeNext`
)
SELECT
--  *
  cte.id,
  cte.scraper,
  parsedValue,
  --  downloadId,
  downloadData, filename, byteLength, complete
FROM cte
LEFT JOIN downloadCache ON downloadCache.id = cte.cacheId -- grab additional download information outside of ordering
WHERE recurseDepth = {{lowestDepth}}
ORDER BY
  recurseDepth,
  incrementIndex,
  parseIndex,
  levelOrder
