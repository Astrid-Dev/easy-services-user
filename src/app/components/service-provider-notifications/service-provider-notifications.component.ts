import { Component, OnInit } from '@angular/core';
import {NotificationService} from "../../services/notification.service";
import {TranslationService} from "../../services/translation.service";
import {
  getARequestStateNotificationDescription,
  getARequestStateNotificationImage, getARequestStateNotificationTitle,
  printReadableDate,
  printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {Notification, NotificationEnum} from "../../models/Notification";
import {Router} from "@angular/router";

@Component({
  selector: 'app-service-provider-notifications',
  templateUrl: './service-provider-notifications.component.html',
  styleUrls: ['./service-provider-notifications.component.scss'],
})
export class ServiceProviderNotificationsComponent implements OnInit {

  constructor(
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {}

  get notifications(){
    return this.notificationService.providerRequestsNotifications;
  }

  notificationImagePath(state){
    return getARequestStateNotificationImage(state);
  }

  notificationTitle(state: number){
    return this.translationService.getValueOf(getARequestStateNotificationTitle(state));
  }

  notificationDescription(state: number, requestCode: string){
    let result = '';
    getARequestStateNotificationDescription(state, requestCode, true)
      .forEach((elt, index) =>{
        result += elt.shouldNotTranslate ? elt.key : this.translationService.getValueOf(elt.key);
        if(index > 0){
          result += ' ';
        }
      });
    return result;
  }

  printDate(date: Date | string, withDelay: boolean = false)
  {
    date = typeof date === 'string' ? new Date(date) : date;
    return !withDelay ? printReadableDate(date, this.translationService.getCurrentLang(), true, true)
      : printReadableDateComparedToDelay(date, this.translationService.getCurrentLang());
  }

  onViewNotification(notification: Notification){
    this.notificationService.readANotification(notification.id);
    if(notification.reason === NotificationEnum.PROVIDER_REQUEST){
      this.router.navigate(['dashboard/requests/'+notification.data?.enquiry_code]);
    }
  }

}
