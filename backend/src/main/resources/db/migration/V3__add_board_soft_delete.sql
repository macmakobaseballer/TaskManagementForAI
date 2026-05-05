ALTER TABLE boards ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_boards_deleted_at ON boards (deleted_at) WHERE deleted_at IS NULL;
