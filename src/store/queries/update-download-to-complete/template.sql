UPDATE downloads
SET
  filename = $filename,
  complete = 1
WHERE id = $downloadId
