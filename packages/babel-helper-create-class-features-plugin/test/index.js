import runner from "@babel/helper-plugin-test-runner";

// Fixtures here run preset-env (see
// fixtures/plugin-proposal-class-properties/no-loose-and-assumptions-preset-env)
// with `validateLogs: true`, so the fixture runner captures console.warn into
// the fixture's stderr.txt comparison. With caniuse-lite pinned to its 2022
// release by the lockfile, browserslist's oldDataWarning() emits
// "Browserslist: caniuse-lite is outdated" on any later run, which fails the
// comparison even though the transform output is unchanged. Suppress only the
// advisory; all other warnings still reach stderr.txt.
process.env.BROWSERSLIST_IGNORE_OLD_DATA = "1";

runner(import.meta.url);
