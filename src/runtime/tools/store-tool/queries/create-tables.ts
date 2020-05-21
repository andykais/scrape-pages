import { sql, Query } from './query-base'

const template = sql`
BEGIN TRANSACTION;

-- We delete the tree each time we start the scraper because adding more cache logic is a pain and rewalking the tree is cheap.
-- downloadCache remains 'cached' though, so we do not reuse bandwidth unnecessarily
-- We also delete commands. It means technically you could completely change the instructions and this would chug along fine. The only thing that is reused is the cache
CREATE TABLE IF NOT EXISTS programState (
  Lock INTEGER PRIMARY KEY CHECK (Lock = 1),
  state TEXT NOT NULL,
  version TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS commands (
  id INTEGER PRIMARY KEY NOT NULL,
  label TEXT
);

CREATE TABLE IF NOT EXISTS crawlerTree (
  id INTEGER PRIMARY KEY NOT NULL,
  commandId INT NOT NULL,
  parentTreeId INT,
  operatorIndex INT NOT NULL, -- index that represents either a .reduce() or .loop() index
  valueIndex INT NOT NULL, -- index that represents the index of a value in a command output
  value TEXT NOT NULL, -- it is only empty while an incomplete command is in progress
  networkRequestId INT, -- this is a denormalized column
  FOREIGN KEY (parentTreeId) REFERENCES crawlerTree(id),
  FOREIGN KEY (networkRequestId) REFERENCES networkRequests(id),
  FOREIGN KEY (commandId) REFERENCES commands(id)
);

-- this table is only written to when cache:true
CREATE TABLE IF NOT EXISTS networkRequests (
  id INTEGER PRIMARY KEY NOT NULL,
  commandId INT NOT NULL, -- this exists purely for debugging...I think
  requestParams TEXT NOT NULL,
  responseValue TEXT,
  mimeType TEXT,
  filename TEXT,
  byteLength TEXT,
  status BIT NOT NULL --  QUEUED:0, COMPLETE:1, FAILED:2
);

CREATE INDEX IF NOT EXISTS command ON crawlerTree(commandId);
CREATE INDEX IF NOT EXISTS requestParams ON networkRequests(requestParams);

COMMIT;
`

class CreateTables extends Query {
  public call = () => {
    this.database.pragma('foreign_keys = OFF')
    this.database.exec(template)
    this.database.pragma('foreign_keys = ON')
  }
}

export { CreateTables }
