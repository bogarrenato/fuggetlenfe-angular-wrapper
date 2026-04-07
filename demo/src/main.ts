import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { BrandOneShowcaseAppComponent } from './app/app';

bootstrapApplication(BrandOneShowcaseAppComponent, appConfig)
  .catch((bootstrapError) => console.error(bootstrapError));
