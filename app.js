const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------
const ICONS = {
  youtube: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="#fff"/><path d="M10 9l5 3-5 3z" fill="#e8141c"/></svg>',
  amazon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V7a3 3 0 016 0v1"/></svg>',
  expedia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>',
  calendly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  maps: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.6" fill="#1a7f2e"/></svg>',
};

const SITES = {
  youtube: {
    name: "YouTube", key: "youtube", count: 28, bg: "linear-gradient(160deg,#ff2b2b,#e00000)", color: "#e8141c",
    fns: ["search()", "getVideo()", "getTranscript()", "listComments()", "getChannel()", "createPlaylist()", "addToPlaylist()", "getPlaylist()", "listChannelVideos()", "getLiveChat()"],
    code: ["", "const [top] = await youtube.search({", "  query: 'kyoto travel guide'", "});", "", "const t = await youtube.getTranscript(", "  top.id", ");"],
    out: "→ transcript · 1,842 lines · 18:42 video · 0.6s",
    json: "{ title: 'KYOTO — 3 perfect days', lines: 1842, … }",
  },
  amazon: {
    name: "Amazon", key: "amazon", count: 15, bg: "linear-gradient(160deg,#232323,#050505)", color: "#131921",
    fns: ["searchProducts()", "getProduct()", "listReviews()", "listDeals()", "listBestSellers()", "listVariations()", "listNewReleases()", "getSeller()"],
    code: ["", "const bags = await amazon.searchProducts(", "  {", "    keywords: 'carry on luggage',", "    maxPrice: 150,", "    minRating: 4.5", "  }", ");"],
    out: "→ 48 products · from $69.99 · 0.4s",
    json: "[{ title: 'Hardside Spinner 22\"', price: 69.99, rating: 4.5 }, …]",
  },
  expedia: {
    name: "Expedia", key: "expedia", count: 4, bg: "linear-gradient(160deg,#ffe14d,#ffc800)", color: "#ffc72c", dark: true,
    fns: ["searchHotels()", "getHotel()", "getRooms()", "listReviews()"],
    code: ["", "const stays = await expedia.searchHotels(", "  {", "    location: 'Kyoto',", "    checkIn: '2026-11-13',", "    checkOut: '2026-11-16'", "  }", ");"],
    out: "→ 3 hotels · from $184/night · 0.4s",
    json: "[{ name: 'Hyatt Place Kyoto', price: 184, rating: 4.4 }, …]",
  },
  calendly: {
    name: "Calendly", key: "calendly", count: 4, bg: "linear-gradient(160deg,#1a6bff,#0040e0)", color: "#006bff",
    fns: ["getAvailability()", "getEventTypes()", "getBookingForm()", "findProfiles()"],
    code: ["", "const slots = await calendly.getAvailability(", "  {", "    profile: 'jane-park',", "    event: '30min',", "    date: '2026-11-03'", "  }", ");"],
    out: "→ 6 open slots · next: Tue 2:00 PM · 0.3s",
    json: "[{ start: '2026-11-03T14:00', duration: 30 }, …]",
  },
  maps: {
    name: "Google Maps", key: "maps", count: 11, bg: "linear-gradient(160deg,#25a244,#0d7a26)", color: "#1a7f2e",
    fns: ["searchPlaces()", "searchNearby()", "getPlace()", "getDirections()", "listReviews()", "listPhotos()", "suggestPlaces()", "geocodeAddress()", "reverseGeocode()"],
    code: ["", "const cafes = await maps.searchNearby(", "  {", "    query: 'coffee',", "    near: 'Shibuya, Tokyo',", "    openNow: true", "  }", ");"],
    out: "→ 12 places · 4.5★ avg · 0.3s",
    json: "[{ name: 'Fuglen Tokyo', rating: 4.6, walk: '6 min' }, …]",
  },
};
const ORDER = ["youtube", "amazon", "expedia", "calendly", "maps"];

// ---------------------------------------------------------------------------
// Hero: fanned cards
// ---------------------------------------------------------------------------
const FAN = [
  { k: "youtube", x: -530, y: 0, r: -5, z: 1 },
  { k: "amazon", x: -335, y: 45, r: 2, z: 2 },
  { k: "expedia", x: -125, y: 85, r: -2, z: 3 },
  { k: "calendly", x: 95, y: 30, r: 3, z: 2 },
  { k: "maps", x: 290, y: 70, r: -4, z: 3 },
];
$("fan").innerHTML = FAN.map(({ k, x, y, r, z }) => {
  const s = SITES[k];
  const shown = s.fns.slice(0, Math.min(10, s.fns.length));
  const more = s.count - shown.length;
  return `<button class="scard ${s.dark ? "dark-text" : ""}" data-site="${k}"
    style="left:calc(50% + ${x}px);top:${y}px;z-index:${z};background:${s.bg};--rest:rotate(${r}deg);transform:rotate(${r}deg)">
    <div class="cap"><span>${s.count} capabilities</span>${ICONS[k]}</div>
    <div class="name">${s.name}</div>
    <ul>${shown.map((f) => `<li><i>fx</i>${f}</li>`).join("")}</ul>
    ${more > 0 ? `<div class="more">+ ${more} more</div>` : ""}
  </button>`;
}).join("");
document.querySelectorAll(".scard").forEach((c) =>
  c.addEventListener("click", () => {
    showSite(c.dataset.site);
    $("agent").scrollIntoView({ behavior: "smooth" });
  })
);

// ---------------------------------------------------------------------------
// agent.ts typing panel
// ---------------------------------------------------------------------------
$("site-pills").innerHTML = ORDER.map((k) => `<button data-site="${k}"><i style="background:${SITES[k].color}"></i>${SITES[k].name}</button>`).join("");
document.querySelectorAll("#site-pills button").forEach((b) => b.addEventListener("click", () => showSite(b.dataset.site)));

let typingRun = 0;
let currentSite = "expedia";
async function showSite(k) {
  const run = ++typingRun;
  currentSite = k;
  const s = SITES[k];
  document.querySelectorAll("#site-pills button").forEach((b) => b.classList.toggle("active", b.dataset.site === k));
  document.querySelectorAll(".scard").forEach((c) => c.classList.toggle("active", c.dataset.site === k));
  $("cw-status").textContent = "running…";
  $("cw-out").classList.remove("on");
  const body = $("cw-body");
  const chipStyle = `background:${s.color};color:${s.dark ? "#1c1c1a" : "#fff"}`;
  body.innerHTML = `<div class="cline"><span class="g">$</span><span class="t">import { <span class="chip" style="${chipStyle}">${ICONS[k]}${s.key}</span> } from '@decomp/web';</span></div>`;
  for (const line of s.code) {
    if (run !== typingRun) return;
    const row = document.createElement("div");
    row.className = "cline";
    row.innerHTML = '<span class="g">$</span><span class="t"></span><span class="caret"></span>';
    body.appendChild(row);
    const t = row.querySelector(".t");
    for (const ch of line) {
      if (run !== typingRun) return;
      t.textContent += ch;
      await sleep(18);
    }
    row.querySelector(".caret").remove();
    await sleep(60);
  }
  await sleep(350);
  if (run !== typingRun) return;
  $("cw-status").textContent = "✓ done";
  $("cw-out").innerHTML = `<div class="ok">${esc(s.out)}</div><div class="json">${esc(s.json)}</div>`;
  $("cw-out").classList.add("on");
  await sleep(3200);
  if (run !== typingRun) return;
  showSite(ORDER[(ORDER.indexOf(k) + 1) % ORDER.length]);
}
// start typing once the panel is visible
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { showSite(currentSite); o.disconnect(); } }, { threshold: 0.3 }).observe($("codewin"));

// ---------------------------------------------------------------------------
// Race: same task, two ways
// ---------------------------------------------------------------------------
const TASKS = [
  {
    id: "hotel", label: "Book a hotel", site: "expedia",
    prompt: "Book me a hotel in Kyoto for 3 nights, under $200",
    code: `<span class="k">const</span> r = <span class="k">await</span>\n  expedia.searchHotels({\n    location: <span class="s">"Kyoto"</span>,\n    checkIn: <span class="s">"2026-11-13"</span>,\n    checkOut: <span class="s">"2026-11-16"</span>\n  })`,
    fn: "searchHotels", rows: [["Hyatt Place Kyoto", "$184"], ["Hotel Granvia Kyoto", "$196"], ["Hyatt Regency Kyoto", "$241"]],
    result: "→ 3 hotels · from $184/night",
    answer: "Done. 3 nights at Hyatt Place Kyoto, $184 a night, free cancellation.",
    good: { secs: 2.5, tok: 1186, cost: 0.02 }, bad: { secs: 162, tok: 34866, cost: 0.63 },
    url: "expedia.com/Hotel-Search?destination=Kyoto&startDate=2026-11-13…",
    fields: ["Kyoto, Japan", "Nov 13 — Nov 16", "2 guests"],
    items: [["Hyatt Place Kyoto", "Shimogyo, Kyoto · 4.4", "$184"], ["Hotel Granvia Kyoto", "Station, Kyoto · 4.3", "$196"], ["Hyatt Regency Kyoto", "Higashiyama · 4.6", "$241"]],
    steps: ["Opening expedia.com", "Accepting cookie banner", "Typing \"Kyoto\"", "Picking check-in date", "Picking check-out date", "Clicking Search", "Waiting for results…", "Filtering under $200", "Reading room options", "Session expired, reloading", "Re-entering dates"],
    fail: "Solving captcha…",
  },
  {
    id: "product", label: "Find a product", site: "amazon",
    prompt: "Find a carry-on under $150 rated 4.5★ or higher",
    code: `<span class="k">const</span> r = <span class="k">await</span>\n  amazon.searchProducts({\n    keywords: <span class="s">"carry on luggage"</span>,\n    maxPrice: 150,\n    minRating: 4.5\n  })`,
    fn: "searchProducts", rows: [["Hardside Spinner 22\"", "$69.99"], ["Aluminum Carry-On 21\"", "$129.99"], ["Softside Expandable", "$89.00"]],
    result: "→ 48 products · from $69.99",
    answer: "Best pick: Hardside Spinner 22\", 4.5★ from 21k reviews, $69.99.",
    good: { secs: 1.9, tok: 942, cost: 0.01 }, bad: { secs: 190, tok: 41220, cost: 0.74 },
    url: "amazon.com/s?k=carry+on+luggage&rh=p_36%3A-15000…",
    fields: ["carry on luggage", "Under $150", "4★ & up"],
    items: [["Hardside Spinner 22\"", "4.5 · 21,436 ratings", "$69.99"], ["Aluminum Carry-On 21\"", "4.6 · 8,214 ratings", "$129.99"], ["Softside Expandable", "4.4 · 3,127 ratings", "$89.00"]],
    steps: ["Opening amazon.com", "Typing search", "Waiting for results…", "Opening filters", "Setting max price", "Setting rating filter", "Scrolling results", "Skipping sponsored items", "Opening product page", "Reading reviews", "Going back"],
    fail: "\"Are you a robot?\" check",
  },
  {
    id: "video", label: "Summarize a video", site: "youtube",
    prompt: "Summarize the top Kyoto travel guide on YouTube",
    code: `<span class="k">const</span> [v] = <span class="k">await</span>\n  youtube.search({\n    query: <span class="s">"kyoto travel guide"</span>\n  })\n<span class="k">const</span> t = <span class="k">await</span>\n  youtube.getTranscript(v.id)`,
    fn: "getTranscript", rows: [["KYOTO — 3 perfect days", "18:42"], ["Transcript", "1,842 lines"]],
    result: "→ transcript · 1,842 lines",
    answer: "Day 1 Fushimi Inari at dawn, day 2 Arashiyama, day 3 Nishiki Market.",
    good: { secs: 2.8, tok: 2410, cost: 0.04 }, bad: { secs: 245, tok: 58300, cost: 1.05 },
    url: "youtube.com/results?search_query=kyoto+travel+guide",
    fields: ["kyoto travel guide", "All", "Videos"],
    items: [["KYOTO Travel Guide: 3 perfect days", "Mika in Japan · 1.2M views", "18:42"], ["Fushimi Inari at 6 AM", "Nomad Notes · 486K views", "12:07"], ["Kyoto's best temples in one day", "Sora Travels · 2.3M views", "24:15"]],
    steps: ["Opening youtube.com", "Dismissing sign-in prompt", "Typing search", "Opening top video", "Skipping ad", "Opening description", "Clicking \"Show transcript\"", "Scrolling transcript", "Scrolling transcript", "Transcript panel reset", "Scrolling again"],
    fail: "Context window full…",
  },
  {
    id: "place", label: "Find a place", site: "maps",
    prompt: "Find a coffee shop open now near Shibuya",
    code: `<span class="k">const</span> r = <span class="k">await</span>\n  maps.searchNearby({\n    query: <span class="s">"coffee"</span>,\n    near: <span class="s">"Shibuya, Tokyo"</span>,\n    openNow: <span class="k">true</span>\n  })`,
    fn: "searchNearby", rows: [["Fuglen Tokyo", "4.6★"], ["Little Nap Coffee", "4.5★"], ["Streamer Coffee", "4.4★"]],
    result: "→ 12 places · 4.5★ avg",
    answer: "Fuglen Tokyo: 4.6★, 6 min walk, open until 22:00.",
    good: { secs: 1.6, tok: 880, cost: 0.01 }, bad: { secs: 140, tok: 29400, cost: 0.53 },
    url: "google.com/maps/search/coffee+near+Shibuya…",
    fields: ["coffee near Shibuya", "Open now", "Rating"],
    items: [["Fuglen Tokyo", "Coffee shop · 6 min", "4.6★"], ["Little Nap Coffee", "Café · 9 min", "4.5★"], ["Streamer Coffee", "Coffee · 4 min", "4.4★"]],
    steps: ["Opening maps", "Allowing location", "Typing search", "Waiting for map tiles…", "Clicking \"Open now\"", "Panning map", "Opening first result", "Reading hours", "Going back", "List re-sorted"],
    fail: "Lost track of results",
  },
  {
    id: "meet", label: "Book a meeting", site: "calendly",
    prompt: "Book 30 min with Jane Park next Tuesday afternoon",
    code: `<span class="k">const</span> r = <span class="k">await</span>\n  calendly.getAvailability({\n    profile: <span class="s">"jane-park"</span>,\n    event: <span class="s">"30min"</span>,\n    date: <span class="s">"2026-11-03"</span>\n  })`,
    fn: "getAvailability", rows: [["Tue 2:00 PM", "open"], ["Tue 3:30 PM", "open"], ["Tue 4:00 PM", "open"]],
    result: "→ 6 open slots",
    answer: "Booked Tue Nov 3, 2:00 PM with Jane Park. Invite sent.",
    good: { secs: 2.2, tok: 1020, cost: 0.02 }, bad: { secs: 175, tok: 37800, cost: 0.68 },
    url: "calendly.com/jane-park/30min?month=2026-11",
    fields: ["30 Minute Meeting", "November 2026", "PST"],
    items: [["Tue, Nov 3 · 2:00 PM", "30 min", "Select"], ["Tue, Nov 3 · 3:30 PM", "30 min", "Select"], ["Tue, Nov 3 · 4:00 PM", "30 min", "Select"]],
    steps: ["Opening calendly.com", "Finding Jane's page", "Picking event type", "Navigating to November", "Clicking Tuesday", "Reading slots", "Timezone mismatch", "Switching timezone", "Clicking 2:00 PM", "Filling name & email"],
    fail: "Form validation error",
  },
];

$("task-list").innerHTML = TASKS.map((t, i) =>
  `<button class="task ${i === 0 ? "active" : ""}" data-i="${i}"><span class="play"></span>${t.label}<small>${SITES[t.site].name}</small></button>`
).join("");
let raceRun = 0, raceIdx = 0;
document.querySelectorAll(".task").forEach((b) => b.addEventListener("click", () => race(+b.dataset.i)));
$("replay").addEventListener("click", () => race(raceIdx));

const fmtBad = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const chatShell = (title, prompt) =>
  `<div class="chat-title">${title}</div><div class="chat-scroll"><div class="chat-prompt">${esc(prompt)}</div></div><div class="chat-input">Reply to Claude…</div>`;

async function race(i) {
  const run = ++raceRun;
  raceIdx = i;
  const T = TASKS[i], S = SITES[T.site];
  document.querySelectorAll(".task").forEach((b, j) => b.classList.toggle("active", j === i));

  // reset
  $("g-chat").innerHTML = chatShell(T.label, T.prompt);
  $("b-chat").innerHTML = chatShell(T.label, T.prompt);
  $("g-code").innerHTML = ""; $("g-done").textContent = ""; $("g-res").textContent = "";
  $("g-state").textContent = ""; $("b-state").textContent = "";
  $("b-tab").textContent = new URL("https://" + T.url).hostname;
  $("b-url").textContent = T.url;
  const headColor = S.key === "expedia" ? "#191e3b" : S.key === "youtube" ? "#202020" : S.color;
  $("b-site").innerHTML = `<div class="site-head" style="background:${headColor}">${S.name}<span>Sign in</span></div>
    <div class="site-search">${T.fields.map((f) => `<div>${esc(f)}</div>`).join("")}</div><div id="b-rows"></div>`;
  const cursor = $("b-cursor");
  cursor.style.left = "60%"; cursor.style.top = "30%";

  const BAD_REAL = 8000; // ms of real time for the browser replay
  const scale = BAD_REAL / T.bad.secs; // ms per simulated second
  const t0 = performance.now();

  // timers / counters
  const tick = () => {
    if (run !== raceRun) return;
    const el = performance.now() - t0;
    const gSec = Math.min(el / 1000, T.good.secs);
    const bSec = Math.min(el / scale, T.bad.secs);
    $("g-time").textContent = gSec.toFixed(1) + "s";
    $("b-time").textContent = fmtBad(bSec);
    $("g-bar").style.width = (gSec / T.bad.secs) * 100 + "%";
    $("b-bar").style.width = (bSec / T.bad.secs) * 100 + "%";
    $("g-tok").textContent = Math.round(T.good.tok * gSec / T.good.secs).toLocaleString();
    $("g-cost").textContent = "$" + (T.good.cost * gSec / T.good.secs).toFixed(2);
    $("b-tok").textContent = Math.round(T.bad.tok * bSec / T.bad.secs).toLocaleString();
    $("b-cost").textContent = "$" + (T.bad.cost * bSec / T.bad.secs).toFixed(2);
    if (gSec >= T.good.secs) $("g-state").textContent = "Done";
    if (bSec < T.bad.secs) requestAnimationFrame(tick);
    else $("b-state").textContent = "Blocked";
  };
  requestAnimationFrame(tick);

  // good side
  (async () => {
    const lines = T.code.split("\n");
    for (let n = 1; n <= lines.length; n++) {
      if (run !== raceRun) return;
      $("g-code").innerHTML = lines.slice(0, n).join("\n");
      await sleep(T.good.secs * 1000 * 0.35 / lines.length);
    }
    await sleep(T.good.secs * 1000 * 0.2);
    if (run !== raceRun) return;
    const scroll = $("g-chat").querySelector(".chat-scroll");
    const card = document.createElement("div");
    card.className = "chat-res";
    card.innerHTML = `<div class="muted small">${T.fn} · Decomp AI <span class="good-c">✓ 0.4s</span></div>` +
      T.rows.map(([a, b]) => `<b><span>${esc(a)}</span><span>${esc(b)}</span></b>`).join("");
    scroll.appendChild(card);
    await sleep(T.good.secs * 1000 * 0.45);
    if (run !== raceRun) return;
    const ans = document.createElement("div");
    ans.className = "chat-ans";
    ans.textContent = T.answer;
    scroll.appendChild(ans);
    $("g-done").textContent = "✓ done";
    $("g-res").textContent = `${T.result} · ${T.good.secs}s`;
  })();

  // bad side
  (async () => {
    const scroll = $("b-chat").querySelector(".chat-scroll");
    const all = [...T.steps, T.fail];
    const per = BAD_REAL / all.length;
    for (let n = 0; n < all.length; n++) {
      if (run !== raceRun) return;
      scroll.querySelectorAll(".cur").forEach((e) => e.classList.remove("cur"));
      const st = document.createElement("div");
      const last = n === all.length - 1;
      st.className = "chat-step " + (last ? "cur" : "cur");
      st.textContent = all[n];
      scroll.appendChild(st);
      while (scroll.children.length > 9) scroll.children[1].remove();
      // browser visuals
      cursor.style.left = 25 + Math.random() * 60 + "%";
      cursor.style.top = 25 + Math.random() * 60 + "%";
      const rows = $("b-rows");
      if (rows && n >= Math.floor(all.length * 0.55) && rows.children.length < T.items.length && !last) {
        const [a, b, c] = T.items[rows.children.length];
        rows.insertAdjacentHTML("beforeend", `<div class="site-row"><div class="thumb"></div><div class="info"><b>${esc(a)}</b><span class="muted">${esc(b)}</span></div><div class="price">${esc(c)}</div></div>`);
      }
      if (last) {
        st.className = "chat-step fail";
        $("b-site").insertAdjacentHTML("beforeend", `<div class="captcha"><b>Verify you're human</b><div><i></i>I'm not a robot</div></div>`);
        const r = $("b-rows"); if (r) r.remove();
      }
      await sleep(per);
    }
  })();
}
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { race(0); o.disconnect(); } }, { threshold: 0.25 }).observe($("race"));

// ---------------------------------------------------------------------------
// Lead enrichment
// ---------------------------------------------------------------------------
const LEADS = [
  {
    tab: "DTC brand", name: "Northwind Coffee Co.", domain: "northwindcoffee.com", logo: "N", color: "#6b4a2f",
    calls: [
      { s: "amazon", fn: "getSeller", res: "42 products · 4.6★ · #3 in Ground Coffee", fields: [["Amazon", "42 products · 4.6★"], ["Best-seller rank", "#3 Ground Coffee"]] },
      { s: "youtube", fn: "getChannel", res: "38.2K subscribers · uploaded 3 days ago", fields: [["YouTube", "38.2K subs · active"]] },
      { s: "maps", fn: "searchPlaces", res: "3 cafés in Portland, OR · 4.7★ (1,240 reviews)", fields: [["Locations", "3 cafés · Portland, OR"], ["Google rating", "4.7★ · 1,240 reviews"]] },
      { s: "calendly", fn: "findProfiles", res: "Dana Ruiz, Founder · 30-min intro link", fields: [["Decision maker", "Dana Ruiz, Founder"], ["Book a call", "calendly.com/dana-northwind"]] },
      { s: "expedia", fn: "searchHotels", skip: "not relevant for this lead, skipped" },
    ],
    signal: ["Signal", "Opened 3rd café in Sep"], score: 92, secs: 1.8, cost: 0.03,
  },
  {
    tab: "Hotel", name: "Kyoto Garden Hotel", domain: "kyotogardenhotel.jp", logo: "K", color: "#2f7d6d",
    calls: [
      { s: "expedia", fn: "getHotel", res: "4.4★ · 86 rooms · from $184/night", fields: [["Expedia", "4.4★ · from $184/night"], ["Size", "86 rooms"]] },
      { s: "maps", fn: "getPlace", res: "Shimogyo, Kyoto · 4.5★ (2,310 reviews)", fields: [["Google rating", "4.5★ · 2,310 reviews"], ["Address", "Shimogyo, Kyoto"]] },
      { s: "youtube", fn: "search", res: "14 videos mention it · 1.1M total views", fields: [["YouTube buzz", "14 videos · 1.1M views"]] },
      { s: "calendly", fn: "findProfiles", res: "Kenji Mori, General Manager", fields: [["Decision maker", "Kenji Mori, GM"], ["Book a call", "calendly.com/kenji-kgh"]] },
      { s: "amazon", fn: "getSeller", skip: "no storefront, skipped" },
    ],
    signal: ["Signal", "Reviews mention slow check-in"], score: 86, secs: 2.1, cost: 0.03,
  },
  {
    tab: "Local clinic", name: "Bright Smile Dental", domain: "brightsmile.dental", logo: "B", color: "#006bff",
    calls: [
      { s: "maps", fn: "getPlace", res: "Austin, TX · 4.8★ (612 reviews) · open Sat", fields: [["Google rating", "4.8★ · 612 reviews"], ["Address", "South Lamar, Austin TX"]] },
      { s: "maps", fn: "listReviews", res: "Top theme: \"hard to get an appointment\"", fields: [["Pain point", "Hard to book appointments"]] },
      { s: "calendly", fn: "getAvailability", res: "Booking page found · 3 slots this week", fields: [["Booking", "3 slots this week"], ["Decision maker", "Dr. Priya Shah, Owner"]] },
      { s: "youtube", fn: "getChannel", res: "1.2K subscribers · patient education videos", fields: [["YouTube", "1.2K subs"]] },
      { s: "expedia", fn: "searchHotels", skip: "not relevant for this lead, skipped" },
    ],
    signal: ["Signal", "Booking demand > capacity"], score: 89, secs: 1.6, cost: 0.02,
  },
];

$("lead-tabs").innerHTML = LEADS.map((l, i) => `<button class="${i === 0 ? "active" : ""}" data-i="${i}">${l.tab}</button>`).join("");
document.querySelectorAll("#lead-tabs button").forEach((b) => b.addEventListener("click", () => enrich(+b.dataset.i)));

let leadRun = 0;
const siteIco = (k) => {
  const s = SITES[k];
  const inner = k === "youtube" || k === "maps" ? ICONS[k] : `<span style="display:grid;color:${s.dark ? "#1c1c1a" : "#fff"}">${ICONS[k]}</span>`;
  return `<span class="ico" style="background:${s.color}">${inner}</span>`;
};

async function enrich(i) {
  const run = ++leadRun;
  const L = LEADS[i];
  document.querySelectorAll("#lead-tabs button").forEach((b, j) => b.classList.toggle("active", j === i));
  $("lead-in").innerHTML = `<div class="logo" style="background:${L.color}">${L.logo}</div><b>${esc(L.name)}</b><span>${esc(L.domain)}</span><div class="empty"><i></i><i></i><i></i></div>`;
  $("lead-code").innerHTML = `<span class="k">const</span> lead = <span class="k">await</span>\n  decomp.enrich({\n    company: <span class="s">"${esc(L.name)}"</span>,\n    domain: <span class="s">"${esc(L.domain)}"</span>\n  })\n<span class="c">// → 5 calls, in parallel</span>`;
  $("lead-calls").innerHTML = L.calls.map((c) =>
    `<div class="call-row wait"><div class="call-top">${siteIco(c.s)}<span>${SITES[c.s].key}.${c.fn}()</span><span class="st">queued</span></div><div class="call-res"></div></div>`
  ).join("");
  const allFields = [...L.calls.flatMap((c) => (c.fields || []).map((f) => [...f, SITES[c.s].color])), [...L.signal, "var(--accent)"]];
  $("lead-record").innerHTML = `<div class="rec-head"><b>${esc(L.name)}</b><span class="score" id="lead-score">fit score –</span></div>` +
    allFields.map(([k]) => `<div class="rec-row"><span class="k">${esc(k)}</span><span class="v ph"></span><span class="src"></span></div>`).join("");
  $("lead-fields").textContent = "0"; $("lead-time").textContent = "0.0s"; $("lead-cost").textContent = "$0.00"; $("lead-timer").textContent = "0.0s";

  const t0 = performance.now();
  const total = L.secs * 1000;
  const tick = () => {
    if (run !== leadRun) return;
    const s = Math.min((performance.now() - t0) / 1000, L.secs);
    $("lead-timer").textContent = s.toFixed(1) + "s";
    $("lead-time").textContent = s.toFixed(1) + "s";
    $("lead-cost").textContent = "$" + (L.cost * s / L.secs).toFixed(2);
    if (s < L.secs) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const rows = [...document.querySelectorAll("#lead-calls .call-row")];
  const recRows = [...document.querySelectorAll("#lead-record .rec-row")];
  let filled = 0;
  // all calls start together (parallel), then finish one by one
  await sleep(150);
  rows.forEach((r, j) => { if (!L.calls[j].skip) { r.className = "call-row run"; r.querySelector(".st").textContent = "running…"; } });
  const per = (total - 300) / L.calls.length;
  for (let j = 0; j < L.calls.length; j++) {
    await sleep(per);
    if (run !== leadRun) return;
    const c = L.calls[j], r = rows[j];
    if (c.skip) {
      r.className = "call-row skip"; r.querySelector(".st").textContent = "skipped"; r.querySelector(".call-res").textContent = c.skip;
      continue;
    }
    r.className = "call-row done";
    r.querySelector(".st").textContent = `✓ ${(120 + Math.random() * 300).toFixed(0)} ms`;
    r.querySelector(".call-res").textContent = c.res;
    for (const [, v] of c.fields) {
      const row = recRows[filled];
      row.querySelector(".v").className = "v";
      row.querySelector(".v").textContent = v;
      row.querySelector(".src").style.background = SITES[c.s].color;
      row.classList.add("filled");
      filled++;
      $("lead-fields").textContent = filled;
    }
  }
  await sleep(200);
  if (run !== leadRun) return;
  const last = recRows[filled];
  last.querySelector(".v").className = "v"; last.querySelector(".v").textContent = L.signal[1];
  last.querySelector(".src").style.background = "var(--accent)"; last.classList.add("filled");
  $("lead-fields").textContent = ++filled;
  $("lead-score").textContent = `fit score ${L.score}`;
  $("lead-score").classList.add("on");
  $("lead-in").querySelector(".empty").innerHTML = "";
  $("lead-in").insertAdjacentHTML("beforeend", `<span class="good-c" style="display:block;margin-top:8px">✓ enriched · ${filled} fields</span>`);
}
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { enrich(0); o.disconnect(); } }, { threshold: 0.25 }).observe($("leads"));

// ---------------------------------------------------------------------------
// Capabilities columns
// ---------------------------------------------------------------------------
const EXTRA = [
  ["Reddit", "#ff4500", 5, ["search()", "getPost()", "getSubredditPosts()", "getSubreddit()", "searchSubreddits()"]],
  ["LinkedIn", "#0a66c2", 4, ["searchJobs()", "getProfile()", "getCompany()", "getJob()"]],
  ["Wikipedia", "#555", 1, ["search()"]],
  ["Google Flights", "#1a73e8", 3, ["search()", "getBookingOptions()", "getPriceGraph()"]],
  ["GitHub", "#24292f", 3, ["listCommits()", "listReleases()", "getProfileReadme()"]],
  ["Walmart", "#0071ce", 1, ["search()"]],
  ["Airbnb", "#ff385c", 6, ["searchStays()", "getListing()", "getAvailability()", "listReviews()", "+2"]],
  ["Yelp", "#d32323", 5, ["search()", "getBusiness()", "listReviews()", "listPhotos()", "+1"]],
  ["Etsy", "#f1641e", 1, ["search()"]],
  ["Zillow", "#006aff", 4, ["searchHomes()", "getHome()", "getEstimate()", "listSold()"]],
  ["Spotify", "#1db954", 7, ["search()", "getTrack()", "getArtist()", "getPlaylist()", "+3"]],
  ["Hacker News", "#ff6600", 3, ["topStories()", "getItem()", "search()"]],
];
const fcard = (name, color, count, fns, icon, focus) => {
  const ico = icon ? `<span class="ico" style="background:${color}">${icon}</span>` : `<span class="ico" style="background:${color}">${name[0]}</span>`;
  const [main, ...rest] = fns.filter((f) => !f.startsWith("+"));
  const shown = rest.slice(0, 4);
  const more = count - 1 - shown.length;
  return `<div class="fcard ${focus ? "focus" : ""}"><div class="fcard-top">${ico}<span>${name}.${main}</span><span class="cnt">${count}</span></div>
    ${shown.length ? `<ul>${shown.map((f) => `<li><i>fx</i>${name}.${f}</li>`).join("")}</ul>` : ""}
    ${more > 0 ? `<div class="more">+${more} more</div>` : ""}</div>`;
};
const focusCards = ORDER.map((k) => {
  const s = SITES[k];
  const icon = k === "youtube" ? ICONS.youtube : k === "maps" ? ICONS.maps : `<span style="color:${s.dark ? "#1c1c1a" : "#fff"};display:grid">${ICONS[k]}</span>`;
  return fcard(s.name, s.color, s.count, s.fns, icon, true);
});
const extraCards = EXTRA.map(([n, c, cnt, f]) => fcard(n, c, cnt, f, null, false));
const cols = [[], [], []];
const mixed = [];
for (let i = 0; i < Math.max(focusCards.length, extraCards.length); i++) {
  if (focusCards[i]) mixed.push(focusCards[i]);
  if (extraCards[i]) mixed.push(extraCards[i]);
  if (extraCards[i + 12]) mixed.push(extraCards[i + 12]);
}
mixed.forEach((c, i) => cols[i % 3].push(c));
cols.forEach((c, i) => { $("col" + i).innerHTML = c.join("") + c.join(""); });

// ---------------------------------------------------------------------------
// How it works: isometric scene
// ---------------------------------------------------------------------------
const STEPS = [
  ["Capture", "A crawler loads the site thousands of times and uses every feature on it, recording the requests behind each one: JSON APIs, GraphQL, protobufs and websockets."],
  ["Map", "Every captured request becomes a node in a graph. Requests that work together are joined, and similar ones drift together, so features form on their own."],
  ["Clean", "Some requests belong to no feature: analytics pings, ads and heartbeats. They're dropped, so only the real pieces of each feature remain."],
  ["Name", "An LLM draws a circle around each group and names the feature it performs: searchHotels, getTranscript, searchNearby."],
  ["Assemble", "For each group, the LLM writes one typed interface and fits its requests together into a single function, then tests it against the live site."],
  ["Run natively", "The finished functions load into the Decomp library and run natively in Node or Python, with no browser at all."],
];
const board = $("board"), disc = $("disc"), pad = $("pad");
const CL = [[95, 110, "searchHotels()"], [205, 120, "getTranscript()"], [150, 215, "searchNearby()"]];
const dnodes = [];
for (let i = 0; i < 27; i++) {
  const el = document.createElement("div");
  const noise = i >= 21;
  el.className = "dnode" + (noise ? " noise" : "");
  const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 105;
  const n = { el, noise, c: i % 3, rx: 150 + Math.cos(a) * r, ry: 150 + Math.sin(a) * r, k: i };
  disc.appendChild(el);
  dnodes.push(n);
}
const rings = CL.map(([x, y, label]) => {
  const r = document.createElement("div");
  r.className = "cring";
  r.style.left = x + "px"; r.style.top = y + "px";
  r.innerHTML = `<span class="tag3d">${label}</span>`;
  disc.appendChild(r);
  return r;
});
const KEYS = ["searchHotels()", "getTranscript()", "searchNearby()"];
const keys = KEYS.map((label, i) => {
  const k = document.createElement("div");
  k.className = "key";
  k.style.top = 22 + i * 52 + "px";
  k.innerHTML = `<span class="tag3d">${label}</span>`;
  pad.appendChild(k);
  return k;
});

$("iso-prog").innerHTML = STEPS.map((_, i) => `<button aria-label="Step ${i + 1}" data-i="${i}"></button>`).join("");
let isoStep = 0, isoTimer, isoRun = 0, packetTimer;
document.querySelectorAll("#iso-prog button").forEach((b) => b.addEventListener("click", () => setIso(+b.dataset.i)));

function placeNodes(step) {
  dnodes.forEach((n) => {
    let x = n.rx, y = n.ry;
    if (step >= 1 && !n.noise) {
      const [cx, cy] = CL[n.c];
      const a = (n.k / 7) * Math.PI * 2;
      x = cx + Math.cos(a) * 26; y = cy + Math.sin(a) * 26;
    }
    n.el.style.left = x + "px"; n.el.style.top = y + "px";
    n.el.classList.toggle("on", step >= 1);
    n.el.classList.toggle("gone", n.noise && step >= 2);
  });
}

function shootPackets() {
  // packets fly from the monitor base to random spots on the disc
  let shown = 0;
  clearInterval(packetTimer);
  packetTimer = setInterval(() => {
    const p = document.createElement("div");
    p.className = "packet";
    board.appendChild(p);
    const n = dnodes[shown % dnodes.length];
    const tx = 360 + n.rx, ty = 80 + n.ry;
    p.animate([{ left: "195px", top: "225px", opacity: 1 }, { left: tx + "px", top: ty + "px", opacity: 1 }], { duration: 700, easing: "ease-in" })
      .onfinish = () => { p.remove(); n.el.classList.add("on"); };
    shown++;
    if (shown >= dnodes.length) clearInterval(packetTimer);
  }, 140);
}

async function setIso(i) {
  const run = ++isoRun;
  isoStep = i;
  board.dataset.step = i;
  $("iso-num").textContent = `0${i + 1} / 06`;
  $("iso-title").textContent = STEPS[i][0];
  $("iso-body").textContent = STEPS[i][1];
  document.querySelectorAll("#iso-prog button").forEach((b, j) => { b.classList.toggle("on", j === i); b.classList.toggle("done", j < i); });
  $("iso-prev").disabled = i === 0;
  $("iso-next").disabled = i === STEPS.length - 1;
  clearInterval(packetTimer);
  board.querySelectorAll(".packet").forEach((p) => p.remove());

  if (i === 0) {
    dnodes.forEach((n) => { n.el.classList.remove("on", "gone"); n.el.style.left = n.rx + "px"; n.el.style.top = n.ry + "px"; });
    shootPackets();
  } else placeNodes(i);
  rings.forEach((r) => r.classList.toggle("on", i >= 3));
  keys.forEach((k) => { k.classList.toggle("on", i >= 4); k.classList.remove("press"); });

  const term = $("term-lines");
  term.innerHTML = '<div class="term-line">Welcome to Node.js</div>';
  if (i === 5) {
    for (let j = 0; j < keys.length; j++) {
      await sleep(500);
      if (run !== isoRun) return;
      keys[j].classList.add("press");
      term.insertAdjacentHTML("beforeend", `<div class="term-line">&gt; web.${KEYS[j]} <span class="ok">✓</span></div>`);
      await sleep(250);
      keys[j].classList.remove("press");
    }
    term.insertAdjacentHTML("beforeend", '<div class="term-line">&gt; _</div>');
  }
}
// no autoplay: each step's animation runs when you step to it
const goIso = (i) => { if (i >= 0 && i < STEPS.length) setIso(i); };
$("iso-prev").addEventListener("click", () => goIso(isoStep - 1));
$("iso-next").addEventListener("click", () => goIso(isoStep + 1));
let howVisible = false;
new IntersectionObserver((e) => (howVisible = e[0].isIntersecting), { threshold: 0.4 }).observe($("how"));
document.addEventListener("keydown", (e) => {
  if (!howVisible || e.target.closest("input, textarea")) return;
  if (e.key === "ArrowRight") { goIso(isoStep + 1); e.preventDefault(); }
  if (e.key === "ArrowLeft") { goIso(isoStep - 1); e.preventDefault(); }
});
setIso(0);

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
document.querySelectorAll(".copy[data-copy]").forEach((b) =>
  b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch {}
    b.textContent = "✓"; setTimeout(() => (b.textContent = "⧉"), 1200);
  })
);
