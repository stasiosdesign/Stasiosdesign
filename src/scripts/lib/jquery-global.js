// The Webflow runtime is jQuery-based and reads `window.jQuery` when it runs.
// Importing this module before the runtime guarantees the global is in place.
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
