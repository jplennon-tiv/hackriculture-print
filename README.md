# hackriculture-print

A local gardening reference, content editor and printable growing-sheet generator. It produces vegetable and pest/disease guides as A4 PDFs, with imperial/metric controls and scaled A5/A6 output.

This project is also the master gardening-data editor for the sibling website (`hackriculture`) and video project (`hackriculture-video`). The three gardening JSON files live only in `../hackriculture-data/`; there are no project-local copies. At the last verification, the collection contained 44 crops, 14 trouble groups and eight navigation groups.

## Start working

From `/Users/johnlennon/Documents/web_site/hackriculture-print`, run:

```sh
zsh start.command
```

The launcher selects the Node version in `.nvmrc`, prompts privately for a session admin password and starts the local server on port 5173. Keep its Terminal open; Control-C stops it.

- [Browse crops](http://127.0.0.1:5173/vegetable/carrot)
- [Edit shared data](http://127.0.0.1:5173/admin/login)
- [Preview a metric carrot PDF](http://127.0.0.1:5173/api/pdf/vegetable/carrot?inline=1&units=metric&paper=A4)

## Working documentation

- [AGENTS.md](AGENTS.md): concise rules for coding assistants; read first.
- [DEVELOPMENT.md](DEVELOPMENT.md): architecture, accepted print design, data contracts and validation.
- [SETUP.md](SETUP.md): local commands, dependencies and troubleshooting.
- [SHARED-DATA.md](SHARED-DATA.md): data ownership, backups and cross-project effects.
- [Planting illustration progress](docs/planting-illustrations/PROGRESS.md): resume point, all 44 crop briefs, RHS correction audit and draft-image batch status.

Update the relevant document when behaviour or architecture changes. Keep these files focused on current practice; historical migration details and prior documentation belong in shared backups.
