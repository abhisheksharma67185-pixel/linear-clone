-- +goose Up
-- +goose StatementBegin

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Users ---------------------------------------------------------------------
-- NextAuth's standard `users` table, extended with a few control-plane
-- columns. IDs are text so that the app layer may assign ULIDs (`usr_...`);
-- we still default to a uuid cast to text for migrations / manual inserts.
create table if not exists users (
    id              text primary key default ('usr_' || replace(gen_random_uuid()::text, '-', '')),
    email           citext not null unique,
    email_verified  timestamptz,
    name            text,
    image           text,
    password_hash   text,                 -- argon2id, null for OAuth-only users
    default_org_id  text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create index if not exists users_email_idx on users (email);

-- Orgs ----------------------------------------------------------------------
create table if not exists orgs (
    id                    text primary key default ('org_' || replace(gen_random_uuid()::text, '-', '')),
    name                  text not null,
    slug                  citext not null unique,
    plan                  text not null default 'free' check (plan in ('free','pro','team','enterprise')),
    stripe_customer_id    text,
    stripe_subscription_id text,
    trial_ends_at         timestamptz,
    created_by            text references users(id) on delete set null,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);
create index if not exists orgs_created_by_idx on orgs (created_by);

alter table users
    add constraint users_default_org_fk
    foreign key (default_org_id) references orgs(id) on delete set null;

-- Org members ---------------------------------------------------------------
create table if not exists org_members (
    org_id     text not null references orgs(id)  on delete cascade,
    user_id    text not null references users(id) on delete cascade,
    role       text not null check (role in ('owner','admin','member','viewer')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (org_id, user_id)
);
create index if not exists org_members_user_idx on org_members (user_id);
create index if not exists org_members_role_idx on org_members (org_id, role);

-- Projects ------------------------------------------------------------------
create table if not exists projects (
    id           text primary key default ('proj_' || replace(gen_random_uuid()::text, '-', '')),
    org_id       text not null references orgs(id) on delete cascade,
    name         text not null,
    slug         citext not null,
    description  text,
    retention_days integer not null default 30 check (retention_days > 0),
    created_by   text references users(id) on delete set null,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    unique (org_id, slug)
);
create index if not exists projects_org_idx on projects (org_id);

-- API keys ------------------------------------------------------------------
-- `prefix` is the human-visible portion (e.g. `tk_live_abcd1234`) and is the
-- only part shown to users after creation. `key_hash` is argon2id of the full
-- secret. Lookups hash-then-compare; indexed on `prefix` for fast routing.
create table if not exists api_keys (
    id           text primary key default ('key_' || replace(gen_random_uuid()::text, '-', '')),
    project_id   text not null references projects(id) on delete cascade,
    name         text not null,
    prefix       text not null unique,
    key_hash     text not null,
    scopes       text[] not null default array['traces:write','traces:read']::text[],
    last_used_at timestamptz,
    created_by   text references users(id) on delete set null,
    created_at   timestamptz not null default now(),
    revoked_at   timestamptz,
    expires_at   timestamptz
);
create index if not exists api_keys_project_idx on api_keys (project_id);
create index if not exists api_keys_active_idx  on api_keys (project_id) where revoked_at is null;

-- Invites -------------------------------------------------------------------
create table if not exists invites (
    id         text primary key default ('inv_' || replace(gen_random_uuid()::text, '-', '')),
    org_id     text not null references orgs(id) on delete cascade,
    email      citext not null,
    role       text not null check (role in ('owner','admin','member','viewer')),
    token      text not null unique,
    invited_by text references users(id) on delete set null,
    accepted_at timestamptz,
    expires_at timestamptz not null default (now() + interval '7 days'),
    created_at timestamptz not null default now(),
    unique (org_id, email)
);
create index if not exists invites_email_idx on invites (email);
create index if not exists invites_token_idx on invites (token);

-- Webhooks ------------------------------------------------------------------
create table if not exists webhooks (
    id            text primary key default ('wh_' || replace(gen_random_uuid()::text, '-', '')),
    project_id    text not null references projects(id) on delete cascade,
    url           text not null,
    secret        text not null,
    events        text[] not null default array['trace.created','trace.errored']::text[],
    active        boolean not null default true,
    last_delivery_at     timestamptz,
    last_delivery_status integer,
    created_by    text references users(id) on delete set null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);
create index if not exists webhooks_project_idx on webhooks (project_id);

-- NextAuth-compatible: accounts --------------------------------------------
create table if not exists accounts (
    id                  text primary key default ('acct_' || replace(gen_random_uuid()::text, '-', '')),
    user_id             text not null references users(id) on delete cascade,
    type                text not null,
    provider            text not null,
    provider_account_id text not null,
    refresh_token       text,
    access_token        text,
    expires_at          bigint,
    token_type          text,
    scope               text,
    id_token            text,
    session_state       text,
    created_at          timestamptz not null default now(),
    unique (provider, provider_account_id)
);
create index if not exists accounts_user_idx on accounts (user_id);

-- NextAuth-compatible: sessions --------------------------------------------
create table if not exists sessions (
    id            text primary key default ('sess_' || replace(gen_random_uuid()::text, '-', '')),
    session_token text not null unique,
    user_id       text not null references users(id) on delete cascade,
    expires       timestamptz not null,
    created_at    timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions (user_id);
create index if not exists sessions_expires_idx on sessions (expires);

-- NextAuth-compatible: verification_tokens ---------------------------------
create table if not exists verification_tokens (
    identifier text not null,
    token      text not null,
    expires    timestamptz not null,
    primary key (identifier, token)
);
create index if not exists verification_tokens_token_idx on verification_tokens (token);

-- Usage events (billing metering) -------------------------------------------
-- One row per metered occurrence. Aggregated downstream for Stripe.
create table if not exists usage_events (
    id           bigserial primary key,
    org_id       text not null references orgs(id)     on delete cascade,
    project_id   text          references projects(id) on delete cascade,
    kind         text not null check (kind in (
        'trace.ingested',
        'step.ingested',
        'media.bytes_stored',
        'media.bytes_egress',
        'api.request'
    )),
    quantity     numeric(20,4) not null default 1,
    unit         text not null default 'count',
    occurred_at  timestamptz not null default now(),
    stripe_reported_at timestamptz,
    metadata     jsonb not null default '{}'::jsonb
);
create index if not exists usage_events_org_time_idx
    on usage_events (org_id, occurred_at desc);
create index if not exists usage_events_project_time_idx
    on usage_events (project_id, occurred_at desc);
create index if not exists usage_events_unreported_idx
    on usage_events (org_id, kind, occurred_at)
    where stripe_reported_at is null;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
drop table if exists usage_events;
drop table if exists verification_tokens;
drop table if exists sessions;
drop table if exists accounts;
drop table if exists webhooks;
drop table if exists invites;
drop table if exists api_keys;
drop table if exists projects;
drop table if exists org_members;
alter table if exists users drop constraint if exists users_default_org_fk;
drop table if exists orgs;
drop table if exists users;
-- +goose StatementEnd
