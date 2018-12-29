SELECT id FROM downloads
WHERE scrapeNextIndex = ?
AND incrementIndex = ?
AND IFNULL(parseParentId, -1) = ?
AND complete = 1
AND scraper = ?
