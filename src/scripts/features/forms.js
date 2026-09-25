/* ---------------------------------------------------------------------------
   FORM SUBMISSION  (page feature)

   On Webflow's own hosting, its runtime posts every `.w-form` submission to
   Webflow's form API, which only accepts requests from the Webflow-hosted
   domain. Outside Webflow that code path can never succeed, so this feature
   takes over submission and reproduces the same UI states Webflow used: the
   submit button's `data-wait` label while sending, then either the
   `.w-form-done` success block or the `.w-form-fail` error block, plus
   `data-redirect` support.

   It is mounted on every page, scoped to that page's container, and unbinds
   its listeners when the page is unmounted.

   CONFIGURE ME
   ------------
   Set PUBLIC_FORM_ENDPOINT (see .env.example, or the Vercel project's
   environment variables) to any form backend that accepts a POST - Formspree,
   Basin, Formcarry, Getform, your own handler, etc.

   Left unset, the form still works: it falls back to opening the visitor's
   email client with their answers prefilled and addressed to FALLBACK_EMAIL,
   which needs no server at all.
--------------------------------------------------------------------------- */

const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT || '';
const FALLBACK_EMAIL = 'stas@stasiosdesign.com';
const FALLBACK_SUBJECT = 'New enquiry from stasiosdesign.com';

function show(el) { if (el) el.style.display = 'block'; }
function hide(el) { if (el) el.style.display = 'none'; }

// Field label as a human would read it, matching how Webflow named fields.
function labelFor(input) {
  return input.getAttribute('data-name') || input.getAttribute('name') || '';
}

// Collect the form's answers once, so the endpoint and mailto paths agree.
function readFields(form) {
  const out = [];
  const seenRadioGroups = {};
  const inputs = form.querySelectorAll('input, textarea, select');

  for (const input of inputs) {
    const type = (input.type || '').toLowerCase();
    if (type === 'submit' || type === 'button' || type === 'file') continue;

    const label = labelFor(input);
    if (!label) continue;

    if (type === 'radio') {
      if (seenRadioGroups[input.name]) continue;
      seenRadioGroups[input.name] = true;
      const checked = form.querySelector(`input[name="${input.name}"]:checked`);
      out.push({ name: input.name, label, value: checked ? checked.value : '' });
    } else if (type === 'checkbox') {
      out.push({ name: input.name, label, value: input.checked ? 'Yes' : 'No' });
    } else {
      out.push({ name: input.name, label, value: (input.value || '').trim() });
    }
  }
  return out;
}

function openMailClient(fields) {
  const lines = fields.map((f) => `${f.label}: ${f.value}`);
  window.location.href = `mailto:${FALLBACK_EMAIL}` +
    `?subject=${encodeURIComponent(FALLBACK_SUBJECT)}` +
    `&body=${encodeURIComponent(lines.join('\n'))}`;
}

function postToEndpoint(fields) {
  const body = new FormData();
  fields.forEach((f) => body.append(f.name, f.value));

  return fetch(ENDPOINT, {
    method: 'POST',
    body,
    headers: { Accept: 'application/json' },
  }).then((res) => {
    if (!res.ok) throw new Error(`Form endpoint returned ${res.status}`);
    return true;
  });
}

// Takes over one form. Returns the function that gives it back.
function wire(form) {
  const wrap = form.closest('.w-form');
  if (!wrap) return null;

  const done = wrap.querySelector('.w-form-done');
  const fail = wrap.querySelector('.w-form-fail');
  const button = form.querySelector('[type="submit"]');
  const idleLabel = button ? button.value : '';
  const waitLabel = button ? button.getAttribute('data-wait') : '';
  const redirect = form.getAttribute('data-redirect');

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

  function onSubmit(event) {
    event.preventDefault();
    // Webflow's runtime listens for submit on `document`; keep it out of this form.
    event.stopPropagation();

    const fields = readFields(form);

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

    postToEndpoint(fields).then(() => {
      finish(true);
    }).catch((err) => {
      console.error('[forms] submission failed:', err);
      finish(false);
    });
  }

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

export const forms = {
  name: 'forms',
  mount(root) {
    const unbinders = [];
    for (const form of root.querySelectorAll('.w-form form')) {
      const unbind = wire(form);
      if (unbind) unbinders.push(unbind);
    }
    if (!unbinders.length) return;
    return () => { unbinders.forEach((fn) => fn()); };
  },
};
