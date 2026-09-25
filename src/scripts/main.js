// Client entry point, loaded once by the layout. Barba keeps the document
// alive between pages, so this module graph is evaluated exactly once and
// app.js owns everything that happens after that.
import { boot } from './app.js';

boot();
