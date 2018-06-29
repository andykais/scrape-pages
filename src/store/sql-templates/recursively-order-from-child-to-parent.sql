WITH cte AS (
  SELECT
    id,
    level,
    filename,
    parentId,
    parseIndex,
    incrementIndex,
  FROM tree
  WHERE level in {levels}
  UNION ALL
  SELECT
    pTree.id,
    pTree.level,
    cte.filename,
    pTree.parentId,
    pTree.parseIndex,
    pTree.incrementIndex,
  FROM cte
  INNER JOIN tree as pTree
  ON pTree.id = cte.parentId
  WHERE cte.level != :parentLevel
  ORDER BY parseIndex, incrementIndex
)
SELECT * FROM cte WHERE parentId IS NULL
