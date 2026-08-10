/**
 * Shared booking form mount for Contact, Book Tiffany, Get the brief,
 * and homepage / other locations that use [data-booking-form].
 * Preserves Kajabi form 2149687304 fields, validation, and submit.
 */
(function () {
  var KAJABI_EMBED =
    "https://tiffany-golden.mykajabi.com/forms/2149687304/embed.js";
  var OPTIN_ID = "form_submission_get_the_brief";
  var MARKER = "[Get the brief newsletter opt-in]";
  var LABEL = "Get the brief";

  function wantsBrief() {
    var hash = (location.hash || "").toLowerCase();
    if (hash === "#get-the-brief" || hash === "#newsletter") return true;
    try {
      return new URLSearchParams(location.search).get("brief") === "1";
    } catch (e) {
      return false;
    }
  }

  function appendHtmlWithScripts(host, html) {
    var template = document.createElement("template");
    template.innerHTML = html;
    var nodes = Array.prototype.slice.call(template.content.childNodes);
    nodes.forEach(function (node) {
      if (node.nodeName === "SCRIPT") {
        var script = document.createElement("script");
        if (node.src) {
          script.src = node.src;
          script.async = false;
        } else {
          script.text = node.textContent || "";
        }
        Array.prototype.forEach.call(node.attributes || [], function (attr) {
          if (attr.name !== "src") script.setAttribute(attr.name, attr.value);
        });
        host.appendChild(script);
        return;
      }
      if (node.nodeName === "LINK") {
        document.head.appendChild(node.cloneNode(true));
        return;
      }
      host.appendChild(node);
    });
  }

  function injectGetTheBrief(root) {
    if (document.getElementById(OPTIN_ID)) return true;
    var fields = (root || document).querySelectorAll(
      ".checkbox-field.kajabi-form__form-item"
    );
    var last = null;
    fields.forEach(function (field) {
      if (/Private Care Intelligence/i.test(field.textContent || "")) {
        last = field;
      }
    });
    if (!last) return false;

    var wrap = document.createElement("div");
    wrap.className = "checkbox-field kajabi-form__form-item get-the-brief-field";
    wrap.id = "get-the-brief-optin";
    wrap.innerHTML =
      '<label for="' +
      OPTIN_ID +
      '">' +
      '<input type="checkbox" id="' +
      OPTIN_ID +
      '" name="get_the_brief" value="1" />' +
      '<span class="overlay"></span>' +
      '<span class="text">' +
      LABEL +
      "</span>" +
      "</label>";
    last.insertAdjacentElement("afterend", wrap);

    var form = last.closest("form");
    if (form && !form.dataset.briefHooked) {
      form.dataset.briefHooked = "1";
      form.addEventListener("submit", function () {
        var cb = document.getElementById(OPTIN_ID);
        var ta = form.querySelector("textarea");
        if (!cb || !cb.checked || !ta) return;
        if (ta.value.indexOf(MARKER) === -1) {
          ta.value =
            (ta.value ? ta.value.replace(/\s+$/, "") + "\n\n" : "") + MARKER;
        }
      });
    }

    if (wantsBrief()) {
      var box = document.getElementById(OPTIN_ID);
      if (box) box.checked = true;
      var target =
        document.getElementById("get-the-brief") ||
        document.getElementById("booking-form") ||
        document.querySelector("[data-booking-form]");
      if (target && target.scrollIntoView) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
    return true;
  }

  function watchForForm(root) {
    if (injectGetTheBrief(root)) return;
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (injectGetTheBrief(root) || tries > 50) clearInterval(timer);
    }, 200);
  }

  function loadKajabi(host, onReady) {
    var previousWrite = document.write;
    document.write = function (html) {
      appendHtmlWithScripts(host, String(html));
    };

    var loader = document.createElement("script");
    loader.src = KAJABI_EMBED;
    loader.async = false;
    loader.onload = function () {
      document.write = previousWrite;
      if (typeof onReady === "function") onReady();
    };
    loader.onerror = function () {
      document.write = previousWrite;
    };
    host.appendChild(loader);
  }

  function shellMarkup() {
    return (
      '<span id="get-the-brief" class="nav-anchor" aria-hidden="true"></span>' +
      '<div class="cta-transform-frame">' +
      '<div class="cta-transform-panel">' +
      '<div class="cta-transform-left">' +
      '<div class="eyebrow">Transform With Tiffany</div>' +
      '<h2 class="cta-transform-heading">End Silent Suffering.<br><span class="gold">Lead the Transformation</span></h2>' +
      '<p class="cta-transform-sub">Your people. Your P&amp;L. Your reputation.<br>It starts with <em>what you can’t see.</em></p>' +
      '<div class="cta-transform-callout">' +
      '<div class="cta-transform-callout-title">Hidden Doesn’t Mean Harmless.</div>' +
      '<p>What your systems <span class="gold">miss</span> becomes your <span class="gold">risk</span>.</p>' +
      "</div>" +
      '<p class="cta-transform-mission">I’m on a mission to end silent suffering<br>in Care Communities and on University Campuses<br><em>— and I invite you to be part of it.</em></p>' +
      "</div>" +
      '<div class="cta-transform-right">' +
      '<div class="cta-transform-card">' +
      '<div class="cta-transform-ornament" aria-hidden="true"><span></span></div>' +
      '<h3 class="cta-transform-card-title">Let’s Transform.</h3>' +
      '<p class="cta-transform-card-intro">Introduce yourself &amp; how I can help you end silent suffering for your people.</p>' +
      '<div class="kajabi-host" data-kajabi-host></div>' +
      '<div class="curated-privacy">' +
      "Your information is kept strictly confidential." +
      "<strong>We protect your privacy as much as you protect your people.</strong>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function mount(el) {
    if (!el || el.dataset.bookingMounted === "1") return;
    el.dataset.bookingMounted = "1";
    if (!el.id) el.id = "booking-form";
    el.innerHTML = shellMarkup();
    var host = el.querySelector("[data-kajabi-host]");
    loadKajabi(host, function () {
      watchForForm(el);
    });
  }

  function enhanceExistingKajabi() {
    watchForForm(document);
  }

  function init() {
    var mounts = document.querySelectorAll("[data-booking-form]");
    if (mounts.length) {
      mounts.forEach(mount);
    } else {
      enhanceExistingKajabi();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.GoldenBookingForm = { mount: mount, init: init };
})();
