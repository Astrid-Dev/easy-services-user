import { Component, OnInit } from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {NotificationService} from "../../services/notification.service";
import {Router} from "@angular/router";
import {
  getARequestStateNotificationDescription,
  getARequestStateNotificationImage,
  getARequestStateNotificationTitle, printReadableDate, printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {Notification, NotificationEnum} from "../../models/Notification";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  constructor(
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {}

  get notifications(){
    return this.notificationService.userEnquiriesNotifications;
  }

  notificationImagePath(state){
    return getARequestStateNotificationImage(state);
  }

  notificationTitle(state: number){
    return this.translationService.getValueOf(getARequestStateNotificationTitle(state));
  }

  notificationDescription(state: number, requestCode: string){
    let result = '';
    getARequestStateNotificationDescription(state, requestCode, false)
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
    if(notification.reason === NotificationEnum.USER_ENQUIRY){
      this.router.navigate(['history/'+notification.data?.enquiry_code]);
    }
  }

}
