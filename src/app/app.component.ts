import {Component} from '@angular/core';
import {TranslationService} from "./services/translation.service";
import Pusher from "pusher-js";
import {NotificationService} from "./services/notification.service";
import {ThemeService} from "./services/theme.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent{
  constructor(
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ){}
}
