import {ModuleWithProviders, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {HttpLoaderFactory, SharedModule} from './helpers/shared.module';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HTTP_INTERCEPTORS, HttpClient} from "@angular/common/http";

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {RegisterComponent} from './components/register/register.component';
import {LoginComponent} from "./components/login/login.component";
import {WelcomeComponent} from "./components/welcome/welcome.component";
import {NewEnquiryComponent} from "./components/new-enquiry/new-enquiry.component";
import {AuthInterceptor} from "./helpers/auth.interceptor";
import { ServiceProviderRegistrationComponent } from './components/service-provider-registration/service-provider-registration.component';
import {HomeComponent} from "./components/home/home.component";
import {NotificationsFilteringComponent} from "./components/notifications-filtering/notifications-filtering.component";
import {CategoriesListComponent} from "./components/categories-list/categories-list.component";

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    WelcomeComponent,
    NewEnquiryComponent,
    ServiceProviderRegistrationComponent,
    HomeComponent,
    NotificationsFilteringComponent,
    CategoriesListComponent
  ],
  imports: [
    BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      isolate : false
    }),
    SharedModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {

}
