import {Component} from '@angular/core';
import {TranslationService} from "./services/translation.service";
import {NotificationService} from "./services/notification.service";
import {ThemeService} from "./services/theme.service";
import { PushNotificationsService } from './services/push-notifications.service';
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{
  constructor(
    private platform: Platform,
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private pushNotificationsService: PushNotificationsService
  ){
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      // Trigger the push setup
      this.pushNotificationsService.initPush();
    });
  }
}
