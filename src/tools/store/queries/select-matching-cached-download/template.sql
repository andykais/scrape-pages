SELECT id as cacheId, downloadValue, filename, mimeType FROM downloadCache
WHERE scraper = ?
AND downloadData = ?
