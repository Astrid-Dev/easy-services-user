import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {NotificationService} from "../services/notification.service";

@Component({
  selector: 'app-main-tabs-bar',
  templateUrl: './main-tabs-bar.page.html',
  styleUrls: ['./main-tabs-bar.page.scss'],
})
export class MainTabsBarPage implements OnInit {

  currentUrl: string = '';

  constructor(private router: Router, private notificationService: NotificationService) {
    router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url;
        }
      });
  }

  get canShowTabBar(){
    let result = true;

    if(this.currentUrl.includes('/history') && this.currentUrl !== '/history'){
      result = false;
    }
    else if(this.currentUrl === '/new'){
      result = false;
    }

    return result;
  }

  get unreadEnquiriesNotifications(){
    return this.notificationService.unreadEnquiriesNotifications;
  }

  get unreadRequestsNotifications(){
    return this.notificationService.unreadRequestsNotifications;
  }

  ngOnInit() {
  }

  goToNewEnquiry() {
    this.router.navigate(["new"]);
  }

}
