import { Injectable } from '@angular/core';
import {Capacitor} from "@capacitor/core";
import {PushNotifications} from "@capacitor/push-notifications";
import {Router} from "@angular/router";
import {NotificationService} from "./notification.service";
import {Notification, NotificationEnum} from "../models/Notification";

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  private token: string | null = null;

  constructor(private router: Router, private notificationService: NotificationService) { }

  get deviceToken(){
    return this.token;
  }

  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
    this.registerPush();
  }
  private registerPush() {
    PushNotifications.requestPermissions().then(permission => {
      if (permission.receive === 'granted') {
        PushNotifications.register();
      }
      else {
        // If permission is not granted
      }
    });
    PushNotifications.addListener('registration', (token) => {
      this.token = token.value;
      console.log(token);
    });
    PushNotifications.addListener('registrationError', (err)=> {
      console.error(err);
    });
    PushNotifications.addListener('pushNotificationReceived', (notifications) => {
      console.log(notifications);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      const data = notification.notification.data;
      console.log('Action performed: ' + JSON.stringify(notification.notification));
      this.onViewNotification(data);
    });
  }

  private onViewNotification(notification: Notification){
    this.notificationService.readANotification(notification.id);
    if(notification.reason === NotificationEnum.PROVIDER_REQUEST){
      this.router.navigateByUrl('/dashboard/requests/'+notification.data?.enquiry_code);
    }
    else if(notification.reason === NotificationEnum.USER_ENQUIRY){
      this.router.navigateByUrl('/history/'+notification.data?.enquiry_code);
    }
  }
}
