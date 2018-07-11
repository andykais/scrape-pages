SELECT id, parsedValue
FROM parsedTree
WHERE IFNULL(parentId, -1) = ?
