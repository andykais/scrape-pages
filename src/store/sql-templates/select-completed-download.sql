SELECT id FROM downloads
WHERE loopIndex = ?
AND incrementIndex = ?
AND IFNULL(parseParentId, -1) = ?
