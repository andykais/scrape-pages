SELECT
  id
FROM downloads
WHERE scraper = ?
AND IFNULL(parseParentId, -1) = ?
AND loopIndex = ?
AND incrementIndex = ?
