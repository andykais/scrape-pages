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
    downloads.scraper,
    parsedTree.scraper AS currentScraper
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
    pTree.scraper AS currentScraper
  FROM cte
  INNER JOIN parsedTree as pTree
  ON {{{ waitingJoinsSql }}} = pTree.id
  INNER JOIN downloads as pDownloads
  ON pTree.downloadId = pDownloads.id
  ORDER BY
  recurseDepth, -- recurseDepth ensures that we move from the bottom of the tree to the top
  parseIndex, -- parseIndex orders by appearance on html/json
  incrementIndex, -- incrementIndex handles `incrementUntil`
  parentId -- parentId handles `scrapeNext`
)
SELECT
  cte.id,
  cte.scraper,
  parsedValue,
  downloadData, filename, byteLength, complete
{{#if debugMode}}
  , downloadId, recurseDepth, incrementIndex, parseIndex, currentScraper
{{/if}}
FROM cte
LEFT JOIN downloadCache ON downloadCache.id = cte.cacheId -- grab additional download information outside of ordering
{{#unless debugMode}}
  WHERE recurseDepth = {{lowestDepth}}
{{/unless}}
ORDER BY
  recurseDepth,
  incrementIndex,
  parseIndex
