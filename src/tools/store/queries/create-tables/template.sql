BEGIN TRANSACTION;

-- creating the tree and parsing is always re-done on a second pass.
-- The reason for this is because we cannot assume the config is the same on a second run
-- downloadCache remains 'cached' though, so we do not reuse bandwidth unnecessarily
DROP TABLE IF EXISTS downloads;
DROP TABLE IF EXISTS parsedTree;

CREATE TABLE downloads (
  id INTEGER PRIMARY KEY NOT NULL,
  scraper TEXT NOT NULL,
  incrementIndex INT NOT NULL, -- scrape config increment number
  parseParentId INT, -- necessary to distinguish identity steps
  cacheId INT, -- identity steps will not reference downloadCache, neither will cache:false
  FOREIGN KEY (parseParentId) REFERENCES parsedTree(id),
  FOREIGN KEY (cacheId) REFERENCES downloadCache(id)
);

CREATE TABLE parsedTree (
  id INTEGER PRIMARY KEY NOT NULL,
  scraper TEXT NOT NULL,
  downloadId INT NOT NULL,
  parentId INT,
  parseIndex INT NOT NULL, -- index the item appeared on the page
  parsedValue TEXT NOT NULL,
  format TEXT NOT NULL, -- html, json, identity

  FOREIGN KEY (parentId) REFERENCES parsedTree(id),
  FOREIGN KEY(downloadId) REFERENCES downloads(id)
);

-- this table is only written to when cache:true
CREATE TABLE IF NOT EXISTS downloadCache (
  id INTEGER PRIMARY KEY NOT NULL,
  scraper TEXT NOT NULL,
  protocol TEXT NOT NULL,
  downloadData TEXT NOT NULL,
  downloadValue TEXT NOT NULL,
  mimeType TEXT,
  filename TEXT,
  failed BIT DEFAULT (0) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS downloadId ON downloads(id);
CREATE UNIQUE INDEX IF NOT EXISTS indexes ON downloads(scraper, incrementIndex, parseParentId);
CREATE UNIQUE INDEX IF NOT EXISTS indexes ON downloadCache(downloadData);

COMMIT;
