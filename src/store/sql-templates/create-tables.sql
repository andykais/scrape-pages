CREATE TABLE parsedTree (
  id INTEGER PRIMARY KEY
  value TEXT,
  loopIndex INT, -- index of a looped config step (priority high)
  parseIndex INT, -- index the item appeared on the page (priority medium)
  incrementIndex INT, -- index of a url incrementer (priority low)
  horizontalIndex INT, -- index used for consitent order when two parsers are next to each other (priority low and only under certain circumstances)
);

CREATE TABLE downloads (
  parsedTreeId INT,
  url TEXT,
  filename TEXT,
  downloaded BIT,
  FOREIGN KEY(parsedTreeId) REFERENCES parsedTree(id)
);
