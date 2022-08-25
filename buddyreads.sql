\echo 'Delete and recreate buddyreads db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE buddyreads;
CREATE DATABASE buddyreads;
\connect buddyreads

\i buddyreads-schema.sql
-- \i buddyreads-seed.sql

\echo 'Delete and recreate buddyreads_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE buddyreads_test;
CREATE DATABASE buddyreads_test;
\connect buddyreads_test

\i buddyreads-schema.sql
