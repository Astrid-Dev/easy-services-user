import {Component, OnInit} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {NotificationService} from "../../services/notification.service";
import {Router} from "@angular/router";
import {
  getARequestStateNotificationDescription,
  getARequestStateNotificationImage,
  getARequestStateNotificationTitle,
  printReadableDate,
  printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {Notification, NotificationEnum} from "../../models/Notification";
import {ModalController} from "@ionic/angular";
import {NotificationsFilteringComponent} from "../../components/notifications-filtering/notifications-filtering.component";
import {NotificationsFilter, NotificationState, OrderDirection, Period} from "../../models/Filter";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  filter: NotificationsFilter = {
    order_direction: OrderDirection.DESCENDANT,
    period: Period.ALL,
    state: NotificationState.ALL
  }

  constructor(
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private router: Router,
    private modalController: ModalController
  ) { }

  get notifications(){
    return this.notificationService.userEnquiriesNotifications;
  }

  get sortNotifications(){
    const usePeriod = (this.filter.period === Period.CUSTOM || this.filter.period === Period.TODAY);

    let startDate = new Date();
    let endDate = new Date();

    if(this.filter.period === Period.TODAY){
      startDate.setHours(0, 0);
      endDate.setHours(23, 59, 59);
    }
    else if(this.filter.period === Period.CUSTOM){
      startDate = new Date(this.filter.starting_date);
      endDate = new Date(this.filter.ending_date);
    }

    return this.notifications.filter(elt =>{
      let currentDate = new Date(elt.created_at);
      let condition1 = usePeriod ? (currentDate.getTime() >= startDate.getTime() && currentDate.getTime() <= endDate.getTime()) : true;
      let condition2 = (this.filter.state === NotificationState.READED) ? elt.is_read : (this.filter.state === NotificationState.UNREADED) ? !elt.is_read : true;
      return condition2 && condition1;
    }).sort((a, b) =>{
      let date1 = new Date(a.created_at).getTime();
      let date2 = new Date(b.created_at).getTime();
      return this.filter.order_direction === OrderDirection.DESCENDANT ? (date2 - date1) : (date1 - date2);
    });
  }

  ngOnInit() {}

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
        if(index > 0){
          result += ' ';
        }
        result += elt.shouldNotTranslate ? elt.key : this.translationService.getValueOf(elt.key);
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

  async showSortingModal(){
    const modal = await this.modalController.create({
      component: NotificationsFilteringComponent,
      componentProps: {
        'filter': this.filter
      }
    });

    modal.onDidDismiss()
      .then((event) =>{
        console.log(event);
        if(event.data)
        {
          this.filter = event.data;
        }
      });
    return await modal.present();
  }

}
