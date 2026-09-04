/* ---------------------------------------------------------------------------
   STANDALONE FORM SUBMISSION

   On Webflow's own hosting, webflow.js posts every `.w-form` submission to
   Webflow's form API (https://webflow.com/api/v1/form/<site-id>). That API only
   accepts requests from the Webflow-hosted domain, so in a static export the
   submit handler shipped in webflow.js can never succeed - it just falls
   straight through to the "Hmm... something's missing" error block.

   This file takes over submission for those forms and reproduces the exact same
   UI states Webflow used: the submit button's `data-wait` label while sending,
   then either the `.w-form-done` success block or the `.w-form-fail` error
   block, plus `data-redirect` support.

   CONFIGURE ME
   ------------
   Point ENDPOINT at any form backend that accepts a POST - Formspree, Basin,
   Formcarry, Getform, a Netlify function, your own handler, etc. Example:

       var ENDPOINT = 'https://formspree.io/f/xxxxxxxx';

   If ENDPOINT is left empty the form still works: it falls back to opening the
   visitor's email client with their answers prefilled and addressed to
   FALLBACK_EMAIL, which needs no server at all.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var ENDPOINT = '';
  var FALLBACK_EMAIL = 'stas@stasiosdesign.com';
  var FALLBACK_SUBJECT = 'New enquiry from stasiosdesign.com';

  function show(el) { if (el) el.style.display = 'block'; }
  function hide(el) { if (el) el.style.display = 'none'; }

  // Field label as a human would read it, matching how Webflow named fields.
  function labelFor(input) {
    return input.getAttribute('data-name') || input.getAttribute('name') || '';
  }

  // Collect the form's answers once, so the endpoint and mailto paths agree.
  function readFields(form) {
    var out = [];
    var seenRadioGroups = {};
    var inputs = form.querySelectorAll('input, textarea, select');

    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var type = (input.type || '').toLowerCase();
      if (type === 'submit' || type === 'button' || type === 'file') continue;

      var label = labelFor(input);
      if (!label) continue;

      if (type === 'radio') {
        if (seenRadioGroups[input.name]) continue;
        seenRadioGroups[input.name] = true;
        var checked = form.querySelector('input[name="' + input.name + '"]:checked');
        out.push({ name: input.name, label: label, value: checked ? checked.value : '' });
      } else if (type === 'checkbox') {
        out.push({ name: input.name, label: label, value: input.checked ? 'Yes' : 'No' });
      } else {
        out.push({ name: input.name, label: label, value: (input.value || '').trim() });
      }
    }
    return out;
  }

  function openMailClient(fields) {
    var lines = fields.map(function (f) { return f.label + ': ' + f.value; });
    var href = 'mailto:' + FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent(FALLBACK_SUBJECT) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    window.location.href = href;
  }

  function postToEndpoint(fields) {
    var body = new FormData();
    fields.forEach(function (f) { body.append(f.name, f.value); });

    return fetch(ENDPOINT, {
      method: 'POST',
      body: body,
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('Form endpoint returned ' + res.status);
      return true;
    });
  }

  function wire(form) {
    var wrap = form.closest('.w-form');
    if (!wrap) return;
    // Barba re-runs init after every page swap; never double-bind a form.
    if (form.dataset.siteFormsWired === 'true') return;
    form.dataset.siteFormsWired = 'true';

    var done = wrap.querySelector('.w-form-done');
    var fail = wrap.querySelector('.w-form-fail');
    var button = form.querySelector('[type="submit"]');
    var idleLabel = button ? button.value : '';
    var waitLabel = button ? button.getAttribute('data-wait') : '';
    var redirect = form.getAttribute('data-redirect');

    function finish(ok) {
      if (button) {
        button.disabled = false;
        button.classList.remove('w-form-loading');
        if (idleLabel) button.value = idleLabel;
      }
      if (ok && redirect) { window.location = redirect; return; }

      // Same swap Webflow performs: hide the form, reveal done or fail.
      if (ok) { hide(form); show(done); hide(fail); if (done) done.focus(); }
      else { show(fail); hide(done); if (fail) fail.focus(); }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      // webflow.js listens for submit on `document`; keep it out of this form.
      event.stopPropagation();

      var fields = readFields(form);

      if (button) {
        button.disabled = true;
        button.classList.add('w-form-loading');
        if (waitLabel) button.value = waitLabel;
      }

      if (!ENDPOINT) {
        openMailClient(fields);
        finish(true);
        return;
      }

      postToEndpoint(fields).then(function () {
        finish(true);
      }).catch(function (err) {
        console.error('[site-forms] submission failed:', err);
        finish(false);
      });
    });
  }

  function init() {
    // The Webflow password-protection form posts to Webflow's own /.wf_auth
    // endpoint and has no meaning outside Webflow, so leave it alone.
    var forms = document.querySelectorAll('.w-form form:not(.w-password-page)');
    for (var i = 0; i < forms.length; i++) wire(forms[i]);
  }

  // Exposed so the page-transition code can rebind after Barba swaps the
  // container the form lives in.
  window.SiteForms = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
