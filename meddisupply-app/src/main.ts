import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig, appProviders } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, { ...appConfig, providers: [ ...(appConfig.providers ?? []), ...appProviders ] })
  .catch((err) => console.error(err));
