SELECT id FROM downloads
WHERE loopIndex = ?
AND incrementIndex = ?
AND IFNULL(parseParentId, -1) = ?
AND complete = 1
