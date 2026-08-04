const { chromium } = require("playwright-core");

// Point BENCH_CHROME at a Chrome or Chromium binary, or leave it to Playwright's own
const CHROME = process.env.BENCH_CHROME;
const ORIGIN = process.env.BENCH_ORIGIN || "http://127.0.0.1:8099";

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((s.length * p) / 100))];
};

// Load pages by scrolling to the bottom until the wanted number of commits is loaded
const loadTo = async (page, wanted) => {
  for (let i = 0; i < 40; i++) {
    const loaded = await page.evaluate(() => {
      const el = document.querySelector("main");
      return Math.round((el.scrollHeight - 24) / 24);
    });
    if (loaded >= wanted) return loaded;
    await page
      .locator("main")
      .evaluate((el) => (el.scrollTop = el.scrollHeight));
    await page.waitForTimeout(500);
  }
  return -1;
};

const trial = async (browser, bundle, commits, depth) => {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
  });
  await page.goto(
    `${ORIGIN}/bench/harness.html?bundle=${bundle}&commits=${commits}`,
    { waitUntil: "load" },
  );

  const startedAt = Date.now();
  await page.waitForSelector("[data-commit-row]", { timeout: 20000 });
  const firstPaint = Date.now() - startedAt;

  const loaded = await loadTo(page, depth);
  await page.waitForTimeout(800);

  // Scroll up through loaded history, so nothing is fetched while the frames are timed
  const frames = await page.evaluate(async () => {
    const el = document.querySelector("main");
    el.scrollTop = el.scrollHeight;
    await new Promise(requestAnimationFrame);

    for (let i = 0; i < 10; i++) {
      el.scrollTop -= 300;
      await new Promise(requestAnimationFrame);
    }

    const times = [];
    for (let i = 0; i < 120; i++) {
      const t0 = performance.now();
      el.scrollTop -= 300;
      await new Promise(requestAnimationFrame);
      times.push(performance.now() - t0);
    }
    return times;
  });

  const state = await page.evaluate(() => ({
    rows: document.querySelectorAll("[data-commit-row]").length,
    nodes: document.getElementsByTagName("*").length,
    heapMb: performance.memory
      ? Math.round(performance.memory.usedJSHeapSize / 1e6)
      : null,
  }));

  await page.close();
  return {
    firstPaint,
    loaded,
    median: median(frames),
    p95: pct(frames, 95),
    ...state,
  };
};

const main = async () => {
  const depths = [200, 1000, 2600];
  const trials = 3;
  const browser = await chromium.launch(
    CHROME ? { executablePath: CHROME } : {},
  );
  const results = {};

  for (const depth of depths) {
    for (let t = 0; t < trials; t++) {
      for (const [label, bundle] of [
        ["before", "base"],
        ["after", "current"],
      ]) {
        const r = await trial(browser, bundle, 10000, depth);
        const key = `${depth}|${label}`;
        (results[key] = results[key] || []).push(r);
        console.error(
          `${key} trial ${t + 1}: median ${r.median.toFixed(1)}ms p95 ${r.p95.toFixed(1)}ms rows ${r.rows}`,
        );
      }
    }
  }

  await browser.close();

  console.log(
    "\ncommits loaded | build  | frame median | frame p95 | rows in DOM | DOM nodes | heap MB | first paint",
  );
  console.log(
    "---------------|--------|--------------|-----------|-------------|-----------|---------|------------",
  );
  for (const depth of depths) {
    for (const label of ["before", "after"]) {
      const rs = results[`${depth}|${label}`];
      const pick = (k) => median(rs.map((r) => r[k]));
      console.log(
        `${String(depth).padEnd(14)} | ${label.padEnd(6)} | ${pick("median").toFixed(1).padStart(9)} ms | ${pick(
          "p95",
        )
          .toFixed(1)
          .padStart(
            6,
          )} ms | ${String(pick("rows")).padStart(11)} | ${String(pick("nodes")).padStart(9)} | ${String(
          pick("heapMb"),
        ).padStart(7)} | ${String(pick("firstPaint")).padStart(8)} ms`,
      );
    }
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
