import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

import { environment } from './environments/environment';

if (environment.production) {
  window.console.log = () => {};
  window.console.warn = () => {};
  window.console.error = () => {};
  window.console.info = () => {};
  window.console.debug = () => {};
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
