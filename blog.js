// ===== Site settings =====
const CATEGORIES = {
  work: { name: "Work" },
  projects: { name: "Projects" },
  updates: { name: "Updates" },
};
const HOME_POSTS_PER_CATEGORY = 3;
const SITE_TITLE = "Portfolio";

const content = document.getElementById("content");
const allPosts = [];

// Called from each entry file (posts/*.js). The entry's id is its file name.
function post(data) {
  const file = document.currentScript.src.split("/").pop();
  const id = decodeURIComponent(file.replace(/\.js$/, ""));
  allPosts.push({ id, tags: [], content: [], ...data });
}

// Load the entry files listed in list.js, in order. Missing files are skipped.
function loadPosts() {
  return Promise.all(POST_FILES.map((name) => new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = `posts/${name}.js`;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => {
      console.warn(`Entry file not found: posts/${name}.js`);
      resolve();
    };
    document.head.appendChild(s);
  })));
}

// Non-draft entries only, newest first
function visiblePosts() {
  return allPosts
    .filter((p) => !p.draft)
    .sort((a, b) => normDate(b.date).localeCompare(normDate(a.date)));
}

function normDate(d) {
  return String(d || "").replace(/[-/]/g, ".");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ===== Content blocks =====
function figure(inner, caption) {
  return `<figure>${inner}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}

function renderBlock(b) {
  if (typeof b === "string") return `<p>${b}</p>`;
  if (b.heading) return `<h4>${b.heading}</h4>`;
  if (b.quote) return `<blockquote>${b.quote}</blockquote>`;
  if (b.image) {
    return figure(
      `<a href="${b.image}" target="_blank"><img src="${b.image}" alt="${escapeHtml(b.caption || "")}" loading="lazy"></a>`,
      b.caption);
  }
  if (b.video) {
    // gif: true autoplays muted on loop, like a GIF
    const attrs = b.gif ? "autoplay loop muted playsinline" : "controls";
    return figure(`<video src="${b.video}" ${attrs}></video>`, b.caption);
  }
  if (b.youtube) {
    return figure(
      `<div class="yt"><iframe src="https://www.youtube.com/embed/${b.youtube}" allowfullscreen></iframe></div>`,
      b.caption);
  }
  if (b.gallery) {
    const imgs = b.gallery
      .map((src) => `<a href="${src}" target="_blank"><img src="${src}" loading="lazy"></a>`)
      .join("");
    return figure(`<div class="gallery">${imgs}</div>`, b.caption);
  }
  if (b.html) return b.html;
  return "";
}

// ===== List pieces =====
function excerpt(p) {
  if (p.summary) return p.summary;
  const first = p.content.find((b) => typeof b === "string") || "";
  const text = first.replace(/<[^>]+>/g, "");
  return text.length > 110 ? text.slice(0, 110) + "..." : text;
}

function mediaBadges(p) {
  const has = (key) => p.content.some((b) => typeof b === "object" && b[key]);
  let out = "";
  if (has("image") || has("gallery")) out += '<span class="badge">photo</span>';
  if (has("video") || has("youtube")) out += '<span class="badge">video</span>';
  return out;
}

function tagLinks(p) {
  return p.tags
    .map((t) => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">#${t}</a>`)
    .join(" ");
}

function postMeta(p) {
  const cat = CATEGORIES[p.category];
  const catLink = cat ? `<a href="#/category/${p.category}">${cat.name}</a>` : "";
  return `<p class="meta">[${normDate(p.date)}] ${catLink} ${tagLinks(p)}</p>`;
}

function postItem(p) {
  const cover = p.cover
    ? `<a href="#/post/${p.id}"><img class="cover" src="${p.cover}" alt="" loading="lazy"></a>`
    : "";
  return `
    <article class="post">
      ${cover}
      ${postMeta(p)}
      <h3><a href="#/post/${p.id}">${p.title}</a> ${mediaBadges(p)}</h3>
      <p>${excerpt(p)}</p>
      <a class="more" href="#/post/${p.id}">→ Read more</a>
    </article>`;
}

function listBox(title, posts, footer = "") {
  const body = posts.length
    ? posts.map(postItem).join("")
    : '<p class="small">Nothing here yet.</p>';
  return `
    <section class="box">
      <div class="box-title">${title}</div>
      <div class="box-body">${body}${footer}</div>
    </section>`;
}

function template(id) {
  return document.getElementById(id).innerHTML;
}

// ===== Views =====
function viewHome() {
  const posts = visiblePosts();
  let html = template("page-notice");
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const inCat = posts.filter((p) => p.category === key);
    const more = inCat.length > HOME_POSTS_PER_CATEGORY
      ? `<p class="all"><a href="#/category/${key}">→ View all (${inCat.length})</a></p>`
      : "";
    html += listBox(`▣ ${cat.name}`, inCat.slice(0, HOME_POSTS_PER_CATEGORY), more);
  }
  return { title: "", html };
}

function viewCategory(key) {
  const cat = CATEGORIES[key];
  if (!cat) return viewNotFound();
  const posts = visiblePosts().filter((p) => p.category === key);
  return {
    title: cat.name,
    html: listBox(`▣ ${cat.name} (${posts.length})`, posts),
  };
}

function viewTag(tag) {
  const posts = visiblePosts().filter((p) => p.tags.includes(tag));
  return { title: `#${tag}`, html: listBox(`▣ Tag: #${escapeHtml(tag)} (${posts.length})`, posts) };
}

function viewPost(id) {
  const posts = visiblePosts();
  const i = posts.findIndex((p) => p.id === id);
  if (i === -1) return viewNotFound();
  const p = posts[i];
  const newer = posts[i - 1];
  const older = posts[i + 1];
  const cat = CATEGORIES[p.category];
  return {
    title: p.title,
    html: `
      <article class="box post-full">
        <div class="box-title">▣ ${cat ? cat.name : "Entry"}</div>
        <div class="box-body">
          ${postMeta(p)}
          <h2>${p.title}</h2>
          <div class="post-content">${p.content.map(renderBlock).join("\n")}</div>
          <div class="post-nav">
            <span>${older ? `<a href="#/post/${older.id}">« ${older.title}</a>` : ""}</span>
            <span>${newer ? `<a href="#/post/${newer.id}">${newer.title} »</a>` : ""}</span>
          </div>
          <p class="back"><a href="${cat ? `#/category/${p.category}` : "#/"}">↑ Back to list</a></p>
        </div>
      </article>`,
  };
}

function viewNotFound() {
  return {
    title: "404",
    html: `
      <div class="box">
        <div class="box-title">!! 404 !!</div>
        <div class="box-body">
          <p>This page doesn't exist.</p>
          <p><a href="#/">→ Back to home</a></p>
        </div>
      </div>`,
  };
}

// ===== Router =====
// URL examples: #/  #/category/projects  #/post/2026-10-18-retro-website  #/tag/web
function route() {
  const [, view = "", arg = ""] = location.hash.split("/");
  const param = decodeURIComponent(arg);

  const views = {
    "": viewHome,
    category: () => viewCategory(param),
    tag: () => viewTag(param),
    post: () => viewPost(param),
    about: () => ({ title: "About", html: template("page-about") }),
  };
  const page = (views[view] || viewNotFound)();

  content.innerHTML = page.html;
  if (page.after) page.after();
  document.title = page.title ? `${page.title} ::: ${SITE_TITLE}` : `::: ${SITE_TITLE} :::`;

  // Menu highlight: on an entry page, highlight that entry's category
  let current = view ? `#/${view}${arg ? "/" + arg : ""}` : "#/";
  if (view === "post") {
    const p = allPosts.find((x) => x.id === param);
    if (p) current = `#/category/${p.category}`;
  }
  document.querySelectorAll("#menu a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === current);
  });

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
loadPosts().then(route);
