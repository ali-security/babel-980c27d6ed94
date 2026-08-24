import runner from "@babel/helper-plugin-test-runner";

// The lockfile pins caniuse-lite to its 2022 release, so browserslist's
// oldDataWarning() emits "Browserslist: caniuse-lite is outdated" on any run
// made more than six months after that release. Fixtures here set
// `validateLogs: true`, which makes the fixture runner capture console.warn
// into the fixture's stderr.txt comparison, so that stale-data advisory --
// which says nothing about the transform output being asserted -- fails every
// fixture that resolves targets through browserslist. Suppress only the
// advisory; all other warnings still reach stderr.txt.
process.env.BROWSERSLIST_IGNORE_OLD_DATA = "1";

runner(import.meta.url);
