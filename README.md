# pro5generator

Generate .pro5 and .pro6 files from predefined, selectable templates,
with bible words for preach.

## Config
Environment variables.

### `ACCOUNT_DIR`
Defaults to `account/`. Template files must be placed
under `[ACCOUNT_DIR]/[ACCOUNT NAME]`, where `[ACCOUNT NAME]`
is retrieved from the URL: `/#/editor/[ACCOUNT NAME]`

### `PORT`
Defaults to 3000.

### `AWS_*`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_REGION` - example "eu-west-1"
- `AWS_S3_BUCKET`

Create a subdirectory for every account in the S3 bucket.
Add .pro5 and .pro6 files there per account.

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
