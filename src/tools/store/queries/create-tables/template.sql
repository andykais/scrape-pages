BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY NOT NULL,
  scraper TEXT NOT NULL,
  incrementIndex INT NOT NULL, -- scrape config increment number (priority low)
  parseParentId INT, -- necessary to distinguish identity steps
  downloadData TEXT,
  filename TEXT,
  complete BIT,
  failed BIT,
  allChildrenDownloaded BIT,
  identity BIT,
  FOREIGN KEY (parseParentId) REFERENCES parsedTree(id)
);

CREATE TABLE IF NOT EXISTS parsedTree (
  id INTEGER PRIMARY KEY NOT NULL,
  scraper TEXT NOT NULL,
  downloadId INT NOT NULL,
  parentId INT, -- parentIndex references this table
  parseIndex INT NOT NULL, -- index the item appeared on the page (priority medium)
  parsedValue TEXT,
  identity BIT,
  FOREIGN KEY (parentId) REFERENCES parsedTree(id)
  FOREIGN KEY(downloadId) REFERENCES downloads(id)
);

--  horizontalIndex INT, -- index used for consitent order when two parsers are next to each other (priority low and only under certain circumstances)
CREATE UNIQUE INDEX IF NOT EXISTS downloadId ON downloads(id);
CREATE UNIQUE INDEX IF NOT EXISTS indexes ON downloads(scraper, incrementIndex, parseParentId);
COMMIT;
