import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {User} from "../models/User";
import {Notification, NotificationEnum} from "../models/Notification";
import Pusher from "pusher-js";
import {AuthStateService} from "./auth-state.service";
import {HttpClient} from "@angular/common/http";

const NOTIFICATIONS_URL = `${environment.BACKEND_API_URL}notifications`;
const NOTIFICATIONS_CHANNEL = 'notifications';
const USER_ENQUIRY_NOTIFICATIONS_CHANNEL_EVENT = 'user-enquiry-';
const PROVIDER_REQUEST_NOTIFICATIONS_CHANNEL_EVENT = 'provider_request-';

@Injectable({
  providedIn: 'root'
})
export class NotificationService{

  private user!: User;

  private enquiriesNotifications: Notification[] = [];
  private requestsNotifications: Notification[] = [];
  private allNotifications: Notification[] = [];

  hasLoadNotifications: boolean = false;

  constructor(private authStateService: AuthStateService, private http: HttpClient) {
    this.loadNotifications();
    this.authStateService.getUserData()
      .then((user) =>{
        if(user){
          this.user = user;
          const pusher = new Pusher(environment.PUSHER_APP_KEY, {
            cluster: environment.PUSHER_CLUSTER
          });

          const channel = pusher.subscribe(NOTIFICATIONS_CHANNEL);
          channel.bind((USER_ENQUIRY_NOTIFICATIONS_CHANNEL_EVENT+user.id), (data: any) => {
            if(!this.hasLoadNotifications){
              this.loadNotifications();
            }
            let notification = {
              ...data.notification,
              data: JSON.parse(data.notification?.data)
            }
            this.allNotifications.unshift(notification);
            this.enquiriesNotifications.unshift(notification);
          });

          channel.bind((PROVIDER_REQUEST_NOTIFICATIONS_CHANNEL_EVENT+user.id), (data: any) => {
            if(!this.hasLoadNotifications){
              this.loadNotifications();
            }
            let notification = {
              ...data.notification,
              data: JSON.parse(data.notification?.data)
            }
            this.allNotifications.unshift(notification);
            this.requestsNotifications.unshift(notification);
          });
        }
      })
  }

  loadNotifications(){
    this.http.get(NOTIFICATIONS_URL)
      .subscribe({
        next: (res: any) =>{
          this.allNotifications = res.map(elt => {return {
            ...elt,
            data: JSON.parse(elt.data)
          }});
          console.log(res);
          this.splitNotifications();
          this.hasLoadNotifications = true;
        },
        error: (err) =>{
          console.error(err);
          this.hasLoadNotifications = false;
        }
      })
  }

  private splitNotifications(){
    this.requestsNotifications = this.allNotifications.filter(elt => elt.reason === NotificationEnum.PROVIDER_REQUEST);
    this.enquiriesNotifications = this.allNotifications.filter(elt => elt.reason === NotificationEnum.USER_ENQUIRY);
  }

  get userEnquiriesNotifications(){
    return this.enquiriesNotifications.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }

  get providerRequestsNotifications(){
    return this.requestsNotifications.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }

  get unreadEnquiriesNotifications(){
    return this.userEnquiriesNotifications.filter(elt => !elt.is_read);
  }

  get unreadRequestsNotifications(){
    return this.providerRequestsNotifications.filter(elt => !elt.is_read);
  }

  readANotification(notificationId: number){
    this.http.post(NOTIFICATIONS_URL+'/'+notificationId, null)
      .subscribe({
        next: (res) =>{
          this.allNotifications.forEach((elt, index, array) =>{
            if(elt.id === notificationId){
              array[index] = {
                ...elt,
                is_read: true
              }
            }
          });

          this.splitNotifications();
        },
        error: (err) =>{
          console.error(err);
        }
      })
  }
}
