#!/bin/zsh
set -eu
cd "${0:A:h}"
# Select this project's installed Node version without changing the global default.
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    source "$HOME/.nvm/nvm.sh" --no-use
    nvm use --silent
fi
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
    print 'Install a supported Node.js version first; see SETUP.md.'
    exit 1
fi
for data_file in records.json lib/records.mjs vegetable_groups.json; do
    if [[ ! -f "../hackriculture-data/$data_file" ]]; then
        print "Missing shared data: ../hackriculture-data/$data_file. See SHARED-DATA.md."
        exit 1
    fi
done
if [[ ! -d node_modules ]]; then
    print 'Dependencies are missing. Run npm ci in this folder first; see SETUP.md.'
    exit 1
fi
if [[ -z "${ADMIN_PASSWORD:-}" ]]; then
    read -rs 'ADMIN_PASSWORD?Choose the admin password for this session (hidden input): '
    print
    if [[ -z "$ADMIN_PASSWORD" ]]; then
        print 'An empty admin password is not allowed by this launcher.'
        exit 1
    fi
    export ADMIN_PASSWORD
fi
exec npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
