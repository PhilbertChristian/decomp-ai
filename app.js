// ---------- Hero background: animated concentric gradient rings ----------
(() => {
  const c = document.getElementById("hero-bg");
  const ctx = c.getContext("2d");
  let w, h, t = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener("resize", resize);
  const draw = () => {
    t += 0.004;
    ctx.fillStyle = "#efeee9";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.max(w, h) * 0.75;
    for (let i = 14; i >= 0; i--) {
      const r = (R * i) / 14 + Math.sin(t * 2 + i) * 8;
      const hue = 95 + Math.sin(t + i * 0.5) * 40;
      const light = 72 + (i % 2) * 14;
      ctx.beginPath();
      ctx.arc(cx + Math.sin(t + i) * 10, cy + Math.cos(t + i) * 10, Math.max(r, 1), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 70%, ${light}%, ${i < 4 ? 0.95 : 0.55})`;
      ctx.fill();
    }
    // soft centre for legibility
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.42);
    g.addColorStop(0, "rgba(239,238,233,1)");
    g.addColorStop(0.6, "rgba(239,238,233,.85)");
    g.addColorStop(1, "rgba(239,238,233,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    requestAnimationFrame(draw);
  };
  draw();
})();

// ---------- Copy buttons ----------
const copyText = async (text, btn) => {
  try { await navigator.clipboard.writeText(text); } catch {}
  const prev = btn.textContent; btn.textContent = "✓";
  setTimeout(() => (btn.textContent = prev), 1200);
};
document.querySelectorAll(".copy[data-copy]").forEach((b) =>
  b.addEventListener("click", () => copyText(b.dataset.copy, b))
);
const setupCmd = document.getElementById("setup-cmd");
if (setupCmd) {
  document.getElementById("setup-copy").addEventListener("click", (e) => copyText(setupCmd.textContent, e.currentTarget));
  document.querySelectorAll(".stab").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".stab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      setupCmd.textContent = b.dataset.cmd;
    })
  );
}

// ---------- Demo comparison ----------
const TASKS = {
  enrich: {
    prompt: "Enrich Northwind AI — replied \"send more info\"",
    calls: [
      { fn: "pipedrive.getDeal", rows: [["Northwind AI", "Stage: Replied"], ["Contact", "Maya Chen"]] },
      { fn: "linkedin.getProfile", rows: [["Maya Chen", "Head of DevRel"], ["Focus", "Developer community"]] },
      { fn: "crunchbase.getOrganization", rows: [["Series B", "$42M · 2026"], ["Headcount", "120"]] },
      { fn: "news.search", rows: [["Launched agent SDK", "6 days ago"]] },
    ],
    answer: "Enriched and written back to the Pipedrive deal: DevRel buyer, Series B, fresh SDK launch → strong workshop fit.",
    good: { tokens: 1420, cost: 0.02, secs: 2.4 },
    bad: { tokens: 58300, cost: 1.02, time: "14:30" },
    browser: ["Opening Pipedrive", "Finding the deal", "Copying contact name", "Searching LinkedIn", "Login wall — signing in", "Reading profile", "Opening Crunchbase", "Paywall on funding", "Googling news", "Pasting notes into deal"],
    fail: "Still no ICP match written…",
  },
  email: {
    prompt: "Draft phase-two email for Northwind AI",
    calls: [
      { fn: "enrich.getLead", rows: [["Hook", "Agent SDK launch"], ["Audience match", "AI infra engineers"]] },
      { fn: "compose.phaseTwoEmail", rows: [["Subject", "Northwind × SuperOptimal"], ["Pricing", "omitted ✓"], ["CTA", "Pipedrive booking link"]] },
    ],
    answer: "Draft ready in Gmail: personalised to the SDK launch, links the sponsor page, asks for a 20-min call.",
    good: { tokens: 1180, cost: 0.02, secs: 1.9 },
    bad: { tokens: 41200, cost: 0.74, time: "11:05" },
    browser: ["Rereading their reply", "Opening company site", "Skimming blog", "Finding the launch post", "Opening template doc", "Rewriting intro", "Checking audience stats", "Pasting link"],
    fail: "Forgot to remove pricing line",
  },
  luma: {
    prompt: "Build a Luma sponsor page for Northwind AI",
    calls: [
      { fn: "events.pickSlot", rows: [["Date", "Thu Jan 15"], ["City", "SOMA, San Francisco"]] },
      { fn: "compose.agenda", rows: [["Keynote", "Northwind agent SDK"], ["Format", "Hands-on workshop"]] },
      { fn: "pages.publishSponsorPage", rows: [["URL", "/northwind"], ["Packages", "A single · B series"]] },
    ],
    answer: "Sponsor page live at superoptimal.events/northwind, with single-event and multi-city packages.",
    good: { tokens: 2050, cost: 0.03, secs: 2.8 },
    bad: { tokens: 66700, cost: 1.19, time: "42:10" },
    browser: ["Opening Luma", "Duplicating old event", "Writing new title", "Designing cover in Canva", "Exporting image", "Uploading cover", "Writing agenda", "Adding audience section", "Fixing layout"],
    fail: "Luma has no sponsor-package block…",
  },
  series: {
    prompt: "Which replied leads should get the multi-city series pitch?",
    calls: [
      { fn: "pipedrive.listDeals", rows: [["Replied leads", "12"]] },
      { fn: "enrich.batch × 12", rows: [["Multi-city hiring", "5"], ["Raised in last 6 mo", "7"]] },
      { fn: "score.seriesFit", rows: [["Pitch series (SF → SEA → AUS → CHI)", "4 leads"]] },
    ],
    answer: "4 leads tagged \"Series pitch\" in Pipedrive; their sponsor pages lead with Package B.",
    good: { tokens: 3900, cost: 0.06, secs: 4.2 },
    bad: { tokens: 198000, cost: 3.55, time: "2:10:00" },
    browser: ["Exporting deals to CSV", "Opening lead 1/12", "Checking careers page", "Opening lead 2/12", "Checking Crunchbase", "Opening lead 3/12", "Tab crashed"],
    fail: "Gave up at lead 4 of 12",
  },
};

const $ = (id) => document.getElementById(id);
let timers = [];
const clear = () => { timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; };
const later = (fn, ms) => timers.push(setTimeout(fn, ms));

function run(key) {
  clear();
  const T = TASKS[key];
  $("prompt-good").textContent = $("prompt-bad").textContent = T.prompt;
  $("steps-good").innerHTML = $("steps-bad").innerHTML = "";
  $("t-good").textContent = "0.0s"; $("t-bad").textContent = "0:00";
  $("tok-good").textContent = $("tok-bad").textContent = "0 tokens · $0.00";

  // Decomposition side
  const stepMs = (T.good.secs * 1000) / (T.calls.length + 1);
  T.calls.forEach((c, i) => later(() => {
    const el = document.createElement("div");
    el.className = "call";
    el.innerHTML = `<div class="ch"><span>${c.fn}()</span><span class="ok">✓ ${(stepMs / 1000).toFixed(1)}s</span></div>` +
      c.rows.map(([a, b]) => `<div class="row"><span>${a}</span><b>${b}</b></div>`).join("");
    $("steps-good").appendChild(el);
  }, stepMs * (i + 1) * 0.9));
  later(() => {
    const a = document.createElement("div"); a.className = "answer"; a.textContent = T.answer;
    $("steps-good").appendChild(a);
    $("tok-good").textContent = `${T.good.tokens.toLocaleString()} tokens · $${T.good.cost.toFixed(2)}`;
  }, T.good.secs * 1000);
  const start = Date.now();
  const gi = setInterval(() => {
    const s = (Date.now() - start) / 1000;
    if (s >= T.good.secs) { $("t-good").textContent = T.good.secs.toFixed(1) + "s"; clearInterval(gi); return; }
    $("t-good").textContent = s.toFixed(1) + "s";
  }, 50);
  timers.push(gi);

  // Browser agent side (sped-up replay)
  const badTotal = T.bad.time.split(":").map(Number).reduce((a, n) => a * 60 + n, 0);
  const replayMs = 9000;
  const all = [...T.browser, T.fail];
  all.forEach((s, i) => later(() => {
    const el = document.createElement("div");
    const last = i === all.length - 1;
    el.className = "bstep" + (last ? " fail" : "");
    el.innerHTML = `<span class="ic">${last ? "✕" : "✓"}</span>${s}`;
    $("steps-bad").appendChild(el);
    $("steps-bad").parentElement.scrollTop = 1e6;
    if (last) $("tok-bad").textContent = `${T.bad.tokens.toLocaleString()} tokens · $${T.bad.cost.toFixed(2)}`;
  }, (replayMs / all.length) * (i + 1)));
  const bi = setInterval(() => {
    const p = Math.min((Date.now() - start) / replayMs, 1);
    const sec = Math.round(badTotal * p);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = String(sec % 60).padStart(2, "0");
    $("t-bad").textContent = h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
    if (p >= 1) clearInterval(bi);
  }, 100);
  timers.push(bi);
}

let current = "enrich";
document.querySelectorAll(".tab").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    current = b.dataset.task;
    run(current);
  })
);
$("replay").addEventListener("click", () => run(current));
// start demo when visible
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting) { run(current); obs.disconnect(); }
}, { threshold: 0.3 }).observe($("demo"));

// ---------- Function marquee ----------
const FNS = [
  ["Pipedrive.listDeals()", 9, ["Pipedrive.getDeal()", "Pipedrive.updateDeal()", "Pipedrive.addNote()", "+6 more"]],
  ["LinkedIn.getProfile()", 12, ["LinkedIn.getCompany()", "LinkedIn.searchPeople()", "LinkedIn.searchJobs()", "+9 more"]],
  ["Crunchbase.getOrganization()", 7, ["Crunchbase.listFundingRounds()", "Crunchbase.listInvestors()", "+5 more"]],
  ["Luma.getEvent()", 5, ["Luma.listHostEvents()", "Luma.getGuests()", "+3 more"]],
  ["Website.getAbout()", 8, ["Website.getBlog()", "Website.getCareers()", "Website.getPricing()", "+5 more"]],
  ["News.search()", 2, ["News.getArticle()"]],
  ["Gmail.listReplies()", 4, ["Gmail.createDraft()", "Gmail.getThread()", "+2 more"]],
  ["GitHub.getOrg()", 6, ["GitHub.listRepos()", "GitHub.getReleases()", "+4 more"]],
  ["Greenhouse.listJobs()", 2, ["Greenhouse.getJob()"]],
  ["Sheets.appendRow()", 3, ["Sheets.getValues()", "Sheets.updateValues()"]],
  ["ProductHunt.getLaunch()", 3, ["ProductHunt.listLaunches()", "ProductHunt.getMakers()"]],
  ["Email.verify()", 3, ["Email.inferPattern()", "Email.findByName()"]],
];
const card = ([main, n, rest]) =>
  `<div class="fn-card"><div class="top"><span class="main">${main}</span><span class="count">${n} fn</span></div><ul>${rest.map((r) => `<li>${r}</li>`).join("")}</ul></div>`;
const half = Math.ceil(FNS.length / 2);
const fill = (id, list) => { const html = list.map(card).join(""); $(id).innerHTML = html + html; };
fill("track1", FNS.slice(0, half));
fill("track2", FNS.slice(half));

// ---------- How it works ----------
const STEPS = [
  ["Pull replies", "Read every deal in the Pipedrive Sponsors pipeline that moved to \"Replied\" — the leads who asked for more info."],
  ["Enrich", "Call typed functions across LinkedIn, Crunchbase, the company site and news to fill in buyer, stage and recent launches."],
  ["Filter", "Drop leads that don't match an audience you can deliver, so effort goes where a sponsorship makes sense."],
  ["Match", "Group leads by fit: single event vs. multi-city series, and which workshop theme lines up with what they just shipped."],
  ["Compose", "Write the phase-two email and generate a Luma-style sponsor page with agenda, audience and packages — no pricing."],
  ["Book", "The CTA is your Pipedrive scheduler, so every booked call lands back in Pipedrive as a record."],
];
const graph = $("graph");
const clusters = [[18, 30], [50, 60], [82, 35]];
const nodes = [];
for (let i = 0; i < 24; i++) {
  const n = document.createElement("div");
  n.className = "node" + (i >= 20 ? " noise" : "");
  graph.appendChild(n);
  nodes.push({ el: n, c: i % 3, noise: i >= 20, rx: Math.random() * 92 + 2, ry: Math.random() * 85 + 5 });
}
const rings = clusters.map(([x, y], i) => {
  const r = document.createElement("div");
  r.className = "ring";
  r.style.cssText = `left:calc(${x}% - 60px);top:calc(${y}% - 60px);width:120px;height:120px`;
  r.innerHTML = `<label>${["single event", "series", "workshop theme"][i]}</label>`;
  graph.appendChild(r);
  return r;
});
function layout(step) {
  nodes.forEach((n, i) => {
    let x = n.rx, y = n.ry;
    if (step >= 1 && !n.noise) {
      const [cx, cy] = clusters[n.c];
      const a = (i / 7) * Math.PI * 2;
      x = cx + Math.cos(a) * (step >= 4 ? 3 : 8);
      y = cy + Math.sin(a) * (step >= 4 ? 8 : 22);
    }
    n.el.style.left = `calc(${x}% - 7px)`;
    n.el.style.top = `calc(${y}% - 7px)`;
    n.el.classList.toggle("gone", n.noise && step >= 2);
  });
  rings.forEach((r) => r.classList.toggle("on", step >= 3));
}
const list = $("step-list");
let stepIdx = 0, stepTimer;
function showStep(i) {
  stepIdx = i;
  [...list.children].forEach((b, j) => b.classList.toggle("active", j === i));
  $("step-num").textContent = `0${i + 1} / 06`;
  $("step-title").textContent = STEPS[i][0];
  $("step-body").textContent = STEPS[i][1];
  layout(i);
}
STEPS.forEach(([t], i) => {
  const b = document.createElement("button");
  b.className = "step-item";
  b.innerHTML = `<b>0${i + 1}</b>${t}`;
  b.addEventListener("click", () => { clearInterval(stepTimer); showStep(i); });
  list.appendChild(b);
});
showStep(0);
stepTimer = setInterval(() => showStep((stepIdx + 1) % STEPS.length), 3500);

// ---------- Booking CTA ----------
// Replace with the real Pipedrive scheduler link.
const BOOKING_URL = "https://pipedrive.com/scheduler/REPLACE-ME";
document.querySelectorAll("[data-book]").forEach((a) => {
  a.href = BOOKING_URL;
  a.target = "_blank";
  a.rel = "noopener";
});
