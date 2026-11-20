import { bootstrapApplication } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideIonicAngular(), provideRouter(routes, withPreloading(PreloadAllModules)), { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }]
});

