# Graph scrolling benchmark

Measures what the graph costs to scroll, so a change to how it renders can be shown to be a gain
rather than assumed to be one. It runs the real webview bundle in headless Chromium against a
synthetic history, with a stub standing in for the extension host, and compares the current build
against a copy of another build.

## Running it

From the repository root:

```sh
# 1. Build the panel, which is what the benchmark measures
cd panel && pnpm run build && cd ..

# 2. Take the build to compare against, usually the branch this one is based on
mkdir -p bench/base
git show main:media/webview.js > bench/base/webview.js
git show main:media/webview.css > bench/base/webview.css

# 3. Serve the repository, so both builds are reachable
python3 -m http.server 8099 --bind 127.0.0.1 &

# 4. Run it
npx playwright-core   # or: npm i playwright-core
node bench/bench.js
```

`bench/base` is ignored by git: it holds whatever build you are comparing against.

Chromium comes from Playwright's own download. `BENCH_CHROME=/path/to/chrome` uses a browser you
already have instead, and `BENCH_ORIGIN` points at a different server.

## What it reports

Three depths (200, 1000 and 2600 commits loaded), three trials each, the two builds interleaved so
a slow machine moment lands on both. For each it reports the median and 95th percentile cost of a
scroll frame, how many rows are in the DOM, the total node count, the JS heap, and how long the
first rows took to appear.

Frames are timed while scrolling **up** through history that is already loaded, so the numbers
measure rendering rather than the time spent fetching the next page.

## What it is not

The stub answers with a linear history: one branch, no merges, no tags, no stashes. It says nothing
about how a wide graph draws, and nothing about how the extension host behaves. It measures the
panel's rendering, which is the part that grows with how far you scroll.
