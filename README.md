# pro5generator

Generate .pro5 files from predefined, selectable templates, 
with bible words for preach.

## Config
Environment variables.

### `ACCOUNT_DIR`
Defaults to `account/`. Template files must be placed 
under `[ACCOUNT_DIR]/[ACCOUNT NAME]`, where `[ACCOUNT NAME]` 
is retrieved from the URL: `/#/editor/[ACCOUNT NAME]`

### `PORT`
Defaults to 3000.


## Run

```
npm i
npm run bower-install
npm run build
ACCOUNT_DIR=some/dir PORT=1234 node .
```


## Test

```
npm test
```
