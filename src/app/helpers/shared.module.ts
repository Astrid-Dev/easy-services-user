/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import {CommonModule, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslationService} from '../services/translation.service';
import {ScreenService} from '../services/screen.service';
import {SwiperModule} from 'swiper/angular';
import { EnquiryService } from '../services/enquiry.service';
import {HAMMER_GESTURE_CONFIG, HammerModule} from "@angular/platform-browser";
import {HammerConfig} from "./hammer.config";
import { IonicRatingComponentModule } from 'ionic-rating-component';
import {ServiceProviderService} from "../services/service-provider.service";
import {NotificationService} from "../services/notification.service";
import {AuthService} from "../services/auth.service";
import {TokenService} from "../services/token.service";
import {AuthStateService} from "../services/auth-state.service";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {GeolocationService} from "../services/geolocation.service";
import {ThemeService} from "../services/theme.service";
import {PushNotificationsService} from "../services/push-notifications.service";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      isolate: false
    }),
    SwiperModule,
    HammerModule,
    IonicRatingComponentModule,
    NgxChartsModule
  ],
  declarations: [],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
    SwiperModule,
    HammerModule,
    IonicRatingComponentModule,
    NgxChartsModule
  ],
  providers: [{provide: LocationStrategy, useClass: PathLocationStrategy},{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: HammerConfig
  }]
})

export class SharedModule {
  static forRoot(): ModuleWithProviders<any> {
    return {
      ngModule: SharedModule,
      providers: [
        TranslationService,
        ScreenService,
        EnquiryService,
        ServiceProviderService,
        NotificationService,
        AuthService,
        TokenService,
        AuthStateService,
        GeolocationService,
        ThemeService,
        PushNotificationsService
      ]
    };
  }
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
