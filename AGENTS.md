# Agent instructions

Instructions for AI and human contributors using tools such as **Cursor** and **Claude** in this repository.

## Commits: Conventional Commits (required)

Every commit message **must** follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>[optional scope]: <short description>

[optional body]

[optional footer(s)]
```

- **Description:** imperative mood, lowercase start (no trailing period required but stay consistent).
- **Header max length:** keep the first line ≤ **72** characters when practical.

### Allowed types (common)

Use one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

- **`feat`:** new behavior or capability for users.
- **`fix`:** a bug fix.
- **`docs`:** documentation only.
- **`chore`:** maintenance that is not a user-facing feature or fix (deps, config, tooling).
- **`ci`:** CI/CD pipeline or automation only.

### Scope (optional)

A noun in parentheses after the type, e.g. `fix(postgres): handle null connection string`.

### Breaking changes

Either:

- append **`!`** after the type/scope: `feat(api)!: remove legacy endpoint`, or
- add a footer: `BREAKING CHANGE: <what changed and what to do>`.

### Examples (valid)

- `feat(examples): add from-code compose sample`
- `fix(ci): use non-tls dind for self-hosted runners`
- `docs: clarify WAL-G vs backup-push in readme`
- `chore: bump gitlab-ci docker image tags`

### Examples (invalid — do not use)

- `Update dockerfile` (missing type)
- `Fixed bug` (not conventional)
- `WIP` / `misc changes`

When proposing or creating commits, **always** use this format. If multiple unrelated changes exist, **split into multiple commits** rather than one vague message.
