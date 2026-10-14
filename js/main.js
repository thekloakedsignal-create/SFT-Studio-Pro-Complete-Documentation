/*
 * SFT Studio Pro — The Complete User Manual
 * Loads each manual section from /sections/, then wires up
 * the sticky table of contents (scrollspy), mobile drawer,
 * and back-to-top button.
 */

(function () {
  "use strict";

  var SECTIONS = [
    "sections/01-welcome.html",
    "sections/02-part-one.html",
    "sections/03-part-two.html",
    "sections/04-part-three.html",
    "sections/05-part-four.html",
    "sections/06-part-five.html",
    "sections/07-part-six.html",
    "sections/08-part-seven.html",
    "sections/09-part-eight.html",
    "sections/10-part-nine.html",
    "sections/11-quick-reference.html"
  ];

  var manual = document.getElementById("manual");
  var loading = document.getElementById("loading");

  function loadSections() {
    return SECTIONS.reduce(function (chain, path) {
      return chain.then(function () {
        return fetch(path).then(function (res) {
          if (!res.ok) throw new Error(path + " (" + res.status + ")");
          return res.text();
        }).then(function (html) {
          manual.insertAdjacentHTML("beforeend", html);
        });
      });
    }, Promise.resolve());
  }

  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) map[id] = a;
    });

    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var link = map[entry.target.id];
        if (link) {
          link.classList.add("active");
          link.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    Object.keys(map).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  function setupMobileNav() {
    var toggle = document.getElementById("navToggle");
    var scrim = document.getElementById("scrim");

    function close() {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    scrim.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    document.querySelectorAll(".toc a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  function setupBackToTop() {
    var btn = document.getElementById("toTop");
    var onScroll = function () {
      btn.classList.toggle("show", window.scrollY > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  loadSections()
    .then(function () {
      if (loading) loading.remove();
      setupScrollSpy();
    })
    .catch(function (err) {
      if (loading) loading.remove();
      var box = document.createElement("div");
      box.className = "load-error";
      box.innerHTML =
        "<p><strong>The manual could not be assembled.</strong></p>" +
        "<p>One section failed to load: <code></code>. This page loads its " +
        "chapters from the <code>sections/</code> folder, so it must be " +
        "viewed over HTTP (e.g. on GitHub Pages) rather than opened as a " +
        "local file.</p>";
      box.querySelector("code").textContent = err.message;
      manual.appendChild(box);
    });

  setupMobileNav();
  setupBackToTop();
})();