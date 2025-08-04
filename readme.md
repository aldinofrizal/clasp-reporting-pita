## How to

1. clone git repository
2. run `clasp clone <SCRIPT-ID> --rootDir=build` and remove the default Code.gs file `rm -rf build/Code.js`
3. rename .example.constant.ts to constant.ts and adjust content
4. run `npm run build && clasp push`