import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {Nav} from "../../models/Nav";
import {NavigationEnd, Router} from "@angular/router";
import {User} from "../../models/User";
import {AuthStateService} from "../../services/auth-state.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  navs:  (Nav & {isNotifications?: boolean, shouldBeSimpleProvider?: boolean}) [] = [
    {
      label: 'UPDATEPASSWORD.DASHBOARD.SIDEMENU.DASHBOARD',
      link: '/dashboard/stats',
      icon: 'analytics-outline'
    },
    {
      label: 'UPDATEPASSWORD.DASHBOARD.SIDEMENU.REQUESTS',
      link: '/dashboard/requests',
      icon: 'pricetags-outline'
    },
    {
      label: 'UPDATEPASSWORD.DASHBOARD.SIDEMENU.NOTIFICATIONS',
      link: '/dashboard/notifications',
      icon: 'notifications-outline',
      isNotifications: true
    },
    {
      label: 'UPDATEPASSWORD.DASHBOARD.SIDEMENU.CALENDAR',
      link: '/dashboard/calendar',
      icon: 'calendar-number-outline'
    },
    {
      label: 'UPDATEPASSWORD.DASHBOARD.SIDEMENU.PROFILE',
      link: '/dashboard/profile',
      icon: 'person-outline',
      shouldBeSimpleProvider: true
    },
    {
      label: 'UPDATEPASSWORD.DASHBOARD.SIDEMENU.EXIT',
      link: '/home',
      icon: 'exit-outline'
    }
  ];

  user?: User;

  currentNav: string = '';

  constructor(private router: Router, private authStateService: AuthStateService, private notificationService: NotificationService) {
    router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentNav = event.url === "/dashboard" ? this.navs[0].link : event.url;
        }
      });
  }

  get unreadRequestsNotifications(){
    return this.notificationService.unreadRequestsNotifications;
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData(){
    this.authStateService.getUserData()
      .then((userData) =>{
        this.user = userData ?? null;
        if(this.user?.provider?.organization_id){
          this.navs = this.navs.filter(elt => !elt.shouldBeSimpleProvider);
        }
      })
      .catch((err) =>{
        console.error(err);
      });
  }

}
