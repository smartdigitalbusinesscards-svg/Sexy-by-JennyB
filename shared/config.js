// shared/config.js
// Customer-specific values (generated from form submission)

(function () {
  window.BIZ = window.BIZ || {};

  // Defaults (can still be overridden by URL param ?tier=starter|pro|elite)
  window.BIZ.tier = "pro";

  window.BIZ.fullName = "Jenny B";
  window.BIZ.company  = "Sexy By JennyB";
  window.BIZ.tagline  = "Entertainer";
  window.BIZ.title    = "Entertainer";

  window.BIZ.phonePretty = "(209) 604-6209";
  window.BIZ.phoneTel    = "2096046209";

  window.BIZ.email   = "Sexybyjennyb@gmail.com";
  window.BIZ.website = "https://besexywithjennyb.com";

  // Not provided in form, leaving empty will auto-hide booking button
  window.BIZ.bookingLink = "";

  // Nice default prefill
  window.BIZ.textPrefill = "Hey Jenny! I just checked out Sexy By JennyB — I’d love to connect 🙂";

  // Elite-only (ignored unless tier=elite)
  window.BIZ.eliteCtaLabel = "VIP Bonus";
  window.BIZ.eliteCtaUrl   = "https://besexywithjennyb.com";
})();
