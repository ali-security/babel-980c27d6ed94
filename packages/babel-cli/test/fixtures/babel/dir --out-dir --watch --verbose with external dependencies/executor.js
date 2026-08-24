const fs = require("fs");
const assert = require("assert");

// For Node.js <= 10
if (!assert.match) assert.match = (val, re) => assert(re.test(val));

const run = (async function* () {
  let files = [yield, yield].sort();
  assert.match(files[0], /src[\\/]index.js -> lib[\\/]index.js/);
  assert.match(files[1], /src[\\/]main.js -> lib[\\/]main.js/);
  assert.match(yield, /Successfully compiled 2 files with Babel \(\d+ms\)\./);

  logFile("lib/index.js");
  logFile("lib/main.js");
  // wait 200ms for watcher setup
  await new Promise(resolve => setTimeout(resolve, 200));
  fs.writeFileSync("./file.txt", "Updated!");

  files = [yield, yield].sort();
  assert.match(files[0], /src[\\/]index.js -> lib[\\/]index.js/);
  assert.match(files[1], /src[\\/]main.js -> lib[\\/]main.js/);
  assert.match(yield, /Successfully compiled 2 files with Babel \(\d+ms\)\./);

  logFile("lib/index.js");
  logFile("lib/main.js");
})();

run.next();

const batchedStrings = [];
let batchId = 0;

let pendingLine = "";
let queue = Promise.resolve();

// A stdin chunk is not guaranteed to carry exactly one line: when babel writes
// several --verbose "src/x.js -> lib/x.js" lines within the same tick (which is
// what happens on the watch-triggered recompilation) the pipe coalesces them
// into a single chunk. The generator above consumes one line per `yield`, so
// split chunks on newlines and feed it line by line, buffering partial lines.
process.stdin.on("data", function listener(chunk) {
  const lines = (pendingLine + String(chunk)).split("\n");
  pendingLine = lines.pop();

  for (const line of lines) {
    const str = line.trim();
    if (!str) continue;
    queue = queue.then(() => handleLine(str));
  }
});

async function handleLine(str) {
  if (str.startsWith("src")) {
    batchedStrings.push(str);
  } else {
    // "src/index.js -> lib/index.js"-like strings don't always come in order,
    // so we need to collect and sort them before logging.
    if (batchedStrings.length > 0) {
      batchedStrings.sort();
      for (const str of batchedStrings) {
        console.log(`BATCHED(${batchId})`, str);
      }
      batchId++;
      batchedStrings.length = 0;
    }

    console.log(str);
  }

  if ((await run.next(str)).done) {
    process.exit(0);
  }
}

function logFile(file) {
  console.log("EXECUTOR", file, JSON.stringify(fs.readFileSync(file, "utf8")));
}

setTimeout(() => {
  console.error("EXECUTOR TIMEOUT");
  process.exit(1);
}, 5000);
