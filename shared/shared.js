// shared/shared.js
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = (val ?? "").toString();
  }

  function setLink(id, href, label) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!href) {
      // hide parent tile/btn if it's a link
      const tile = el.closest(".tile");
      if (tile) tile.style.display = "none";
      return;
    }
    el.href = href;
    if (label) el.textContent = label;
  }

  function show(el, on) {
    if (!el) return;
    el.style.display = on ? "" : "none";
  }

  function normalizeWebsite(url) {
    if (!url) return "";
    const u = url.trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    return "https://" + u;
  }

  // --- Sheet / modal helpers ---
  const overlay = $("#overlay");
  const sheet = $("#sheet");
  const sheetBody = $("#sheetBody");
  const closeSheetBtn = $("#closeSheetBtn");
  const sheetTitle = $("#sheetTitle");
  const sheetSub = $("#sheetSub");

  function openSheet(title, sub, bodyNode) {
    if (sheetTitle) sheetTitle.textContent = title || "";
    if (sheetSub) sheetSub.textContent = sub || "";
    if (sheetBody) {
      sheetBody.innerHTML = "";
      if (bodyNode) sheetBody.appendChild(bodyNode);
    }
    overlay?.classList.add("open");
    sheet?.classList.add("open");
  }

  function closeSheet() {
    overlay?.classList.remove("open");
    sheet?.classList.remove("open");
    if (sheetBody) sheetBody.innerHTML = "";
  }

  overlay?.addEventListener("click", closeSheet);
  closeSheetBtn?.addEventListener("click", closeSheet);

  // --- Build ---
  const BIZ = window.BIZ || {};

  // Tier precedence: URL > config.js value > starter
  const tierFromUrl = (getParam("tier") || "").toLowerCase();
  const tier = (tierFromUrl || (BIZ.tier || "starter")).toLowerCase();

  document.body.setAttribute("data-tier", tier);

  // Badge + chips
  const tierBadge = $("#tierBadge");
  if (tierBadge) tierBadge.textContent = tier.toUpperCase();
  setText("chipSub", tier === "starter" ? "Scan-ready" : tier.toUpperCase());

  // Fill identity
  setText("fullName", BIZ.fullName || "Your Name");
  setText("companyName", BIZ.company || "Company");
  setText("companyTag", BIZ.tagline || "");
  setText("title", BIZ.title || "");

  // Phone
  setText("phonePretty", BIZ.phonePretty || "");
  const telDigits = (BIZ.phoneTel || "").replace(/[^\d]/g, "");
  const telHref = telDigits ? `tel:${telDigits}` : "";

  // Email
  const email = (BIZ.email || "").trim();
  const mailHref = email ? `mailto:${email}` : "";
  const emailLink = $("#emailLink");
  if (emailLink) {
    if (!email) {
      emailLink.closest(".tile")?.setAttribute("style", "display:none");
    } else {
      emailLink.href = mailHref;
      emailLink.textContent = email;
    }
  }

  // Website
  const website = normalizeWebsite(BIZ.website || "");
  const siteLabel = website ? website.replace(/^https?:\/\//i, "").replace(/\/+$/, "") : "";
  const siteLink = $("#siteLink");
  if (siteLink) {
    if (!website) {
      siteLink.closest(".tile")?.setAttribute("style", "display:none");
    } else {
      siteLink.href = website;
      siteLink.textContent = siteLabel;
    }
  }

  // Buttons
  const callBtn = $("#callBtn");
  const textBtn = $("#textBtn");
  const emailBtn = $("#emailBtn");
  const siteBtn = $("#siteBtn");
  const bookBtn = $("#bookBtn");

  if (callBtn) callBtn.href = telHref || "#";
  if (textBtn) {
    const prefill = (BIZ.textPrefill || "").trim();
    // iOS prefers &body= ; Android SMS uses ?body=
    const body = encodeURIComponent(prefill);
    textBtn.href = telDigits ? `sms:${telDigits}?&body=${body}` : "#";
  }
  if (emailBtn) emailBtn.href = mailHref || "#";
  if (siteBtn) siteBtn.href = website || "#";

  // Booking link: hide if empty
  const booking = normalizeWebsite(BIZ.bookingLink || "");
  if (!booking) {
    show(bookBtn, false);
  } else {
    bookBtn.href = booking;
  }

  // Phone tile opens sheet with Call/Text
  const phoneTile = $("#phoneTile");
  phoneTile?.addEventListener("click", () => {
    const box = document.createElement("div");

    const makeBtn = (label, href, primary = false) => {
      const a = document.createElement("a");
      a.className = "sheetBtn" + (primary ? " primary" : "");
      a.href = href || "#";
      a.target = "_self";
      a.rel = "noopener";
      a.textContent = label;
      if (!href || href === "#") {
        a.style.opacity = "0.45";
        a.style.pointerEvents = "none";
      }
      return a;
    };

    box.appendChild(makeBtn("Call", telHref, true));
    box.appendChild(makeBtn("Text", textBtn?.href || "#", false));

    openSheet("Reach Out", "Choose an option", box);
  });

  // Pro+ utilities
  const isProPlus = tier === "pro" || tier === "elite";
  show($("#qrHint"), isProPlus);
  show($("#utilityRow"), isProPlus);

  // QR generation (uses current page URL without query noise)
  const qrBtn = $("#qrBtn");
  const qrDownloadBtn = $("#qrDownloadBtn");
  let lastQrUrl = "";

  function makeQrUrl() {
    const u = new URL(window.location.href);
    // keep tier in QR so it scans with correct tier
    u.searchParams.set("tier", tier);
    const data = encodeURIComponent(u.toString());
    // external QR service (simple + reliable)
    return `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${data}`;
  }

  qrBtn?.addEventListener("click", () => {
    lastQrUrl = makeQrUrl();

    const box = document.createElement("div");
    box.className = "qrBox";

    const img = document.createElement("img");
    img.alt = "QR Code";
    img.src = lastQrUrl;

    const hint = document.createElement("div");
    hint.className = "qrHintText";
    hint.textContent = "Have someone scan this QR to open your eCard instantly.";

    box.appendChild(img);
    box.appendChild(hint);

    openSheet("Your QR Code", "Scan to open this eCard", box);
  });

  qrDownloadBtn?.addEventListener("click", () => {
    lastQrUrl = lastQrUrl || makeQrUrl();
    const a = document.createElement("a");
    a.href = lastQrUrl;
    a.download = `${(BIZ.company || "ecard").replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Save Contact (vCard)
  const saveBtn = $("#saveContactBtn");
  saveBtn?.addEventListener("click", () => {
    const fn = (BIZ.fullName || "").trim();
    const org = (BIZ.company || "").trim();
    const title = (BIZ.title || "").trim();

    const v = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      fn ? `FN:${fn}` : "",
      org ? `ORG:${org}` : "",
      title ? `TITLE:${title}` : "",
      telDigits ? `TEL;TYPE=CELL:${telDigits}` : "",
      email ? `EMAIL;TYPE=INTERNET:${email}` : "",
      website ? `URL:${website}` : "",
      "END:VCARD"
    ].filter(Boolean).join("\n");

    const blob = new Blob([v], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${(fn || "contact").replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });

  // Defensive: disable broken links
  [callBtn, textBtn, emailBtn, siteBtn].forEach((btn) => {
    if (!btn) return;
    if (!btn.getAttribute("href") || btn.getAttribute("href") === "#") {
      btn.style.opacity = "0.45";
      btn.style.pointerEvents = "none";
    }
  });
})();
