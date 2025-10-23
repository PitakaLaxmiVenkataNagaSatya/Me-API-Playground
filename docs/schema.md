# Database Schema (SQLite via Sequelize)

This project uses SQLite (local file) via Sequelize ORM for ease of setup and portability. You can switch to MySQL or Postgres by setting environment variables (see README).

## Tables

### profiles

Represents the candidate profile (typically a single row for this app).

Columns:
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- name: STRING NOT NULL
- email: STRING UNIQUE NOT NULL
- education: TEXT (free-form)
- skills: JSON (Array of strings)
- projects: JSON (Array of objects: { title, description, links, skills })
- work: JSON (Optional array of roles/companies or free-form representation)
- links: JSON (Object: { github, linkedin, portfolio })
- createdAt: DATE
- updatedAt: DATE

## Indexes
- UNIQUE(email)

If you migrate to MySQL or Postgres, consider adding indexes on:
- (JSON path) projects[*].skills for efficient project-by-skill queries
- (JSON path) skills for frequent skill searches

## Notes
- SQLite stores JSON as TEXT internally; Sequelize serializes/deserializes automatically for JSON fields.
- For production-grade deployments, Postgres or MySQL with appropriate JSON indexes is recommended.
