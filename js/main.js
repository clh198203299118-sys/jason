// ========== Particles Background ==========
(function () {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * h;
    }
    reset() {
      this.x = Math.random() * w;
      this.y = -10;
      this.r = Math.random() * 1.5 + 0.5;
      this.vy = Math.random() * 0.3 + 0.1;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > h + 10) this.reset();
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor((w * h) / 12000), 100);
    particles = Array.from({ length: count }, () => new Particle());
  }
  initParticles();
  window.addEventListener("resize", initParticles);

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    ctx.strokeStyle = "rgba(108, 92, 231, 0.04)";
    ctx.lineWidth = 0.5;
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach((b) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });
    });

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }
  animate();
})();

// ========== Typewriter ==========
(function () {
  const el = document.getElementById("typewriter");
  if (!el) return;
  const phrases = [
    "写代码，也写生活。",
    "记录每一个灵光一闪的瞬间。",
    "分享让知识更有价值。",
    "思考是通向自由的唯一道路。",
    "Stay hungry, stay foolish.",
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let wait = 0;

  function tick() {
    const current = phrases[phraseIdx];

    if (deleting) {
      el.textContent = current.slice(0, charIdx);
      charIdx--;
      if (charIdx < 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        charIdx = 0;
        wait = 40;
        setTimeout(tick, 400);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx);
      charIdx++;
      if (charIdx > current.length) {
        wait = 40;
        if (wait > 0) {
          wait--;
          setTimeout(tick, 80);
          return;
        }
        deleting = true;
        charIdx = current.length;
        setTimeout(tick, 1500);
        return;
      }
    }
    setTimeout(tick, deleting ? 30 : 80);
  }
  tick();
})();

// ========== Mobile Nav Toggle ==========
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav")) links.classList.remove("open");
  });
})();

// ========== Fade-in on Scroll ==========
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
  // Observe cards added after page load
  setTimeout(() => {
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
  }, 500);
})();

// ========== Post Index ==========
// Declares all posts. Each .md file in /posts/ must be listed here.
const POSTS = [
  {
    file: "hello-world.md",
    title: "你好，世界",
    date: "2026-05-18",
    category: "日记",
    summary: "这是我的第一篇博客文章，记录建立这个网站的心情和想法。",
  },
];

// ========== Shared Helpers ==========
function tagClass(cat) {
  if (cat === "日记") return "tag-diary";
  if (cat === "心得") return "tag-thought";
  if (cat === "分享") return "tag-share";
  return "";
}

function estimateReadTime(text) {
  const len = text.replace(/\s/g, "").length;
  const min = Math.max(1, Math.round(len / 400));
  return `${min} 分钟阅读`;
}

function renderPostCard(post) {
  return `
    <a href="post.html?file=${encodeURIComponent(post.file)}" class="card fade-in" style="display:block;">
      <div class="card-title">${post.title}</div>
      <div class="card-meta">
        <span>${post.date}</span>
        <span class="card-tag ${tagClass(post.category)}">${post.category}</span>
      </div>
      ${post.summary ? `<div class="card-summary">${post.summary}</div>` : ""}
    </a>`;
}

function renderPostList(containerId, posts, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const list = limit ? sorted.slice(0, limit) : sorted;
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📝</div><p>还没有文章，敬请期待。</p></div>`;
    return;
  }
  container.innerHTML = list.map(renderPostCard).join("");
}

// ========== Index Page: Recent Posts ==========
renderPostList("recent-posts", POSTS, 5);

// ========== Posts Page: Filter + All Posts ==========
(function () {
  const container = document.getElementById("all-posts");
  const filterBar = document.getElementById("filter-bar");
  if (!container || !filterBar) return;

  let activeCat = "all";

  function renderFiltered() {
    const filtered = activeCat === "all" ? POSTS : POSTS.filter((p) => p.category === activeCat);
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>这个分类下还没有文章。</p></div>`;
      return;
    }
    container.innerHTML = sorted.map(renderPostCard).join("");
  }

  filterBar.addEventListener("click", (e) => {
    if (!e.target.classList.contains("filter-btn")) return;
    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    activeCat = e.target.dataset.cat;
    renderFiltered();
  });

  renderFiltered();
})();

// ========== Post Detail: Load & Render ==========
(function () {
  const titleEl = document.getElementById("post-title");
  const bodyEl = document.getElementById("post-body");
  const dateEl = document.getElementById("post-date");
  const tagEl = document.getElementById("post-tag");
  const readtimeEl = document.getElementById("post-readtime");
  if (!titleEl || !bodyEl) return;

  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");
  if (!file) {
    titleEl.textContent = "文章未找到";
    bodyEl.innerHTML = "<p>请从文章列表选择一篇文章。</p>";
    return;
  }

  const meta = POSTS.find((p) => p.file === file);

  fetch("posts/" + file)
    .then((res) => {
      if (!res.ok) throw new Error("Not found");
      return res.text();
    })
    .then((raw) => {
      // Parse frontmatter: lines between --- delimiters
      let content = raw;
      let fm = {};
      if (raw.startsWith("---")) {
        const end = raw.indexOf("---", 3);
        if (end !== -1) {
          const fmText = raw.slice(3, end).trim();
          fmText.split("\n").forEach((line) => {
            const sep = line.indexOf(":");
            if (sep !== -1) {
              const key = line.slice(0, sep).trim();
              const val = line.slice(sep + 1).trim();
              fm[key] = val;
            }
          });
          content = raw.slice(end + 3).trim();
        }
      }

      const title = fm.title || meta?.title || "无标题";
      const date = fm.date || meta?.date || "";
      const category = fm.category || meta?.category || "";
      const summary = fm.summary || meta?.summary || "";

      document.title = title + " — Fox's Nest";
      titleEl.textContent = title;
      dateEl.textContent = date;
      if (category) {
        tagEl.innerHTML = `<span class="card-tag ${tagClass(category)}">${category}</span>`;
      } else {
        tagEl.textContent = "";
      }

      // Render markdown
      if (typeof marked !== "undefined") {
        marked.setOptions({ breaks: true, gfm: true });
        bodyEl.innerHTML = marked.parse(content);
      } else {
        bodyEl.innerHTML = content.replace(/\n/g, "<br>");
      }

      readtimeEl.textContent = estimateReadTime(content);

      // Code highlighting
      if (typeof hljs !== "undefined") {
        bodyEl.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightElement(block);
        });
      }

      // Meta description
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.content = summary || title;

      // Re-trigger fade-in
      setTimeout(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) e.target.classList.add("visible");
            });
          },
          { threshold: 0.1 }
        );
        document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
      }, 200);
    })
    .catch(() => {
      titleEl.textContent = "文章加载失败";
      bodyEl.innerHTML = "<p>找不到这篇文章，请检查链接是否正确。</p>";
    });
})();

// ========== Footer Year ==========
(function () {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();
