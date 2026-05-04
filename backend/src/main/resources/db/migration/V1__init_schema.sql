-- boards
CREATE TABLE boards (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    title       TEXT             NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_boards        PRIMARY KEY (id),
    CONSTRAINT  ck_boards_title  CHECK (length(trim(title)) > 0)
);

-- lists
CREATE TABLE lists (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    board_id    UUID             NOT NULL,
    title       TEXT             NOT NULL,
    position    DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_lists         PRIMARY KEY (id),
    CONSTRAINT  fk_lists_board   FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT  ck_lists_title   CHECK (length(trim(title)) > 0)
);

-- cards
CREATE TABLE cards (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    list_id     UUID             NOT NULL,
    title       TEXT             NOT NULL,
    description TEXT,
    priority    TEXT             NOT NULL DEFAULT 'medium',
    due_date    DATE,
    position    DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_cards         PRIMARY KEY (id),
    CONSTRAINT  fk_cards_list    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    CONSTRAINT  ck_cards_title   CHECK (length(trim(title)) > 0),
    CONSTRAINT  ck_cards_priority CHECK (priority IN ('high', 'medium', 'low'))
);

-- labels
CREATE TABLE labels (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    board_id    UUID             NOT NULL,
    name        TEXT             NOT NULL,
    color       TEXT             NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_labels        PRIMARY KEY (id),
    CONSTRAINT  fk_labels_board  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT  ck_labels_name   CHECK (length(trim(name)) > 0),
    CONSTRAINT  ck_labels_color  CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- card_labels (M:N 中間表)
CREATE TABLE card_labels (
    card_id     UUID             NOT NULL,
    label_id    UUID             NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_card_labels        PRIMARY KEY (card_id, label_id),
    CONSTRAINT  fk_card_labels_card   FOREIGN KEY (card_id)  REFERENCES cards(id)  ON DELETE CASCADE,
    CONSTRAINT  fk_card_labels_label  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- checklists
CREATE TABLE checklists (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    card_id     UUID             NOT NULL,
    title       TEXT             NOT NULL,
    position    DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_checklists       PRIMARY KEY (id),
    CONSTRAINT  fk_checklists_card  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT  ck_checklists_title CHECK (length(trim(title)) > 0)
);

-- checklist_items
CREATE TABLE checklist_items (
    id              UUID             NOT NULL DEFAULT gen_random_uuid(),
    checklist_id    UUID             NOT NULL,
    text            TEXT             NOT NULL,
    is_completed    BOOLEAN          NOT NULL DEFAULT FALSE,
    position        DOUBLE PRECISION NOT NULL,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT  pk_checklist_items              PRIMARY KEY (id),
    CONSTRAINT  fk_checklist_items_checklist    FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT  ck_checklist_items_text         CHECK (length(trim(text)) > 0)
);

-- セカンダリインデックス
CREATE INDEX idx_lists_board_position
    ON lists (board_id, position);

CREATE INDEX idx_cards_list_position
    ON cards (list_id, position);

CREATE INDEX idx_labels_board
    ON labels (board_id);

CREATE INDEX idx_card_labels_label
    ON card_labels (label_id, card_id);

CREATE INDEX idx_checklists_card_position
    ON checklists (card_id, position);

CREATE INDEX idx_checklist_items_checklist_position
    ON checklist_items (checklist_id, position);
