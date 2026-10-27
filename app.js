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
document.getElementById("setup-copy").addEventListener("click", (e) => copyText(setupCmd.textContent, e.currentTarget));
document.querySelectorAll(".stab").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".stab").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    setupCmd.textContent = b.dataset.cmd;
  })
);

// ---------- Demo comparison ----------
const TASKS = {
  enrich: {
    prompt: "Enrich jane@northwind.io for our CRM",
    calls: [
      { fn: "linkedin.findProfile", rows: [["Jane Park", "VP Revenue Ops"], ["Seniority", "VP"], ["Tenure", "2y 4m"]] },
      { fn: "crunchbase.getOrganization", rows: [["Northwind Labs", "Series B"], ["Headcount", "201–500"], ["Raised", "$58M"]] },
      { fn: "builtwith.getTechStack", rows: [["CRM", "Salesforce"], ["Outreach", "Outreach.io"]] },
    ],
    answer: "Done — Jane Park, VP RevOps at Northwind Labs (Series B, 201–500). Synced 14 fields to Salesforce.",
    good: { tokens: 1240, cost: 0.02, secs: 2.1 },
    bad: { tokens: 61200, cost: 1.04, time: "4:12" },
    browser: ["Opening google.com", "Searching \"Jane Park Northwind\"", "Opening linkedin.com", "Login wall — signing in", "Scrolling profile", "Copying experience section", "Opening crunchbase.com", "Dismissing paywall modal", "Reading funding table", "Opening northwind.io", "Viewing page source"],
    fail: "Rate limited by LinkedIn…",
  },
  company: {
    prompt: "Give me a brief on acme.com before my call",
    calls: [
      { fn: "website.getAbout", rows: [["Acme Corp", "B2B logistics"], ["HQ", "Austin, TX"]] },
      { fn: "crunchbase.listFundingRounds", rows: [["Series C", "$80M · Mar 2026"], ["Series B", "$31M · 2024"]] },
      { fn: "news.search", rows: [["Acme opens EU hub", "2 days ago"]] },
    ],
    answer: "Acme is a Series C logistics platform (Austin). Raised $80M in March; just expanded to the EU.",
    good: { tokens: 1580, cost: 0.03, secs: 2.6 },
    bad: { tokens: 48900, cost: 0.86, time: "3:41" },
    browser: ["Opening acme.com", "Accepting cookie banner", "Clicking About", "Reading page", "Opening crunchbase.com", "Searching \"Acme\"", "Picking wrong Acme", "Going back", "Picking Acme Corp", "Opening news search"],
    fail: "Verify you're human…",
  },
  email: {
    prompt: "Find the work email for Tom Reyes at Bluefin",
    calls: [
      { fn: "website.getTeamPage", rows: [["Tom Reyes", "Head of Growth"]] },
      { fn: "email.inferPattern", rows: [["Pattern", "first.last@bluefin.co"], ["Confidence", "94%"]] },
      { fn: "email.verify", rows: [["tom.reyes@bluefin.co", "deliverable ✓"]] },
    ],
    answer: "tom.reyes@bluefin.co — verified deliverable (94% pattern confidence).",
    good: { tokens: 980, cost: 0.01, secs: 1.8 },
    bad: { tokens: 39300, cost: 0.71, time: "2:58" },
    browser: ["Opening bluefin.co", "Clicking Team", "Scrolling", "Opening contact page", "Reading footer", "Searching github.com", "Opening commits", "Guessing pattern"],
    fail: "Could not verify address",
  },
  hiring: {
    prompt: "Which of my 50 target accounts are hiring SDRs?",
    calls: [
      { fn: "greenhouse.listJobs × 50", rows: [["Accounts scanned", "50"], ["Open SDR roles", "17"]] },
      { fn: "linkedin.searchJobs", rows: [["Posted < 14 days", "9 accounts"]] },
    ],
    answer: "9 accounts posted SDR roles in the last 2 weeks. Tagged as 'Hiring signal' in HubSpot.",
    good: { tokens: 3400, cost: 0.06, secs: 4.4 },
    bad: { tokens: 212000, cost: 3.82, time: "18:20" },
    browser: ["Opening careers page 1/50", "Reading listings", "Opening careers page 2/50", "Iframe not loading", "Opening careers page 3/50", "Reading listings", "Opening careers page 4/50"],
    fail: "Context window full…",
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
  const [mm, ss] = T.bad.time.split(":").map(Number);
  const badTotal = mm * 60 + ss;
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
    $("t-bad").textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
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
  ["LinkedIn.getProfile()", 12, ["LinkedIn.getCompany()", "LinkedIn.searchPeople()", "LinkedIn.searchJobs()", "+9 more"]],
  ["Crunchbase.getOrganization()", 7, ["Crunchbase.listFundingRounds()", "Crunchbase.listInvestors()", "Crunchbase.getPerson()", "+4 more"]],
  ["Apollo.searchContacts()", 5, ["Apollo.getAccount()", "Apollo.listSequences()", "+3 more"]],
  ["GitHub.getOrg()", 6, ["GitHub.listMembers()", "GitHub.listRepos()", "GitHub.getProfile()", "+3 more"]],
  ["BuiltWith.getTechStack()", 3, ["BuiltWith.listCustomers()", "BuiltWith.getSpend()"]],
  ["Greenhouse.listJobs()", 2, ["Greenhouse.getJob()"]],
  ["G2.getReviews()", 4, ["G2.getProduct()", "G2.listCompetitors()", "+2 more"]],
  ["Website.getAbout()", 8, ["Website.getTeamPage()", "Website.getPricing()", "Website.getCareers()", "+5 more"]],
  ["Google Maps.searchPlaces()", 11, ["Google Maps.getPlace()", "Google Maps.listReviews()", "+9 more"]],
  ["Email.verify()", 3, ["Email.inferPattern()", "Email.findByName()"]],
  ["SEC.getFilings()", 4, ["SEC.getOfficers()", "SEC.getFinancials()", "+2 more"]],
  ["News.search()", 2, ["News.getArticle()"]],
];
const card = ([main, n, rest]) =>
  `<div class="fn-card"><div class="top"><span class="main">${main}</span><span class="count">${n} fn</span></div><ul>${rest.map((r) => `<li>${r}</li>`).join("")}</ul></div>`;
const half = Math.ceil(FNS.length / 2);
const fill = (id, list) => { const html = list.map(card).join(""); $(id).innerHTML = html + html; };
fill("track1", FNS.slice(0, half));
fill("track2", FNS.slice(half));

// ---------- How it works ----------
const STEPS = [
  ["Crawl", "A crawler exercises every feature of a site thousands of times, capturing the calls behind each one: REST, GraphQL, protobufs and websockets."],
  ["Embed", "Every captured call becomes a node in a graph. Calls that work together are linked, and embeddings pull similar calls close together."],
  ["Clean", "Analytics pings, ads and heartbeats belong to no feature. These outliers are dropped so only real feature calls remain."],
  ["Circle", "An LLM draws a boundary around each cluster and names the feature it performs: getProfile, searchPeople, listJobs."],
  ["Assemble", "For each cluster, an LLM writes one typed interface and fits the calls together into a single function."],
  ["Run natively", "Finished functions ship in the Decomposition library and run natively in Node or Python — no browser at all."],
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
  r.innerHTML = `<label>${["getProfile()", "searchPeople()", "listJobs()"][i]}</label>`;
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
