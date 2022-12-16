import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { ServiceProviderProfileComponent } from 'src/app/components/service-provider-profile/service-provider-profile.component';
import {ServiceProviderRequestsComponent} from "../../components/service-provider-requests/service-provider-requests.component";
import {ServiceProviderCalendarComponent} from "../../components/service-provider-calendar/service-provider-calendar.component";
import {ServiceProviderStatsComponent} from "../../components/service-provider-stats/service-provider-stats.component";
import {ServiceProviderRequestDetailsComponent} from "../../components/service-provider-request-details/service-provider-request-details.component";
import {ServiceProviderNotificationsComponent} from "../../components/service-provider-notifications/service-provider-notifications.component";
import {IsSimpleEmployeeGuard} from "../../helpers/is-simple-employee.guard";

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: 'stats',
        component: ServiceProviderStatsComponent
      },
      {
        path: 'profile',
        component: ServiceProviderProfileComponent,
        canActivate: [IsSimpleEmployeeGuard]
      },
      {
        path: 'requests',
        component: ServiceProviderRequestsComponent
      },
      {
        path: 'notifications',
        component: ServiceProviderNotificationsComponent
      },
      {
        path: 'requests/:code',
        component: ServiceProviderRequestDetailsComponent
      },
      {
        path: 'calendar',
        component: ServiceProviderCalendarComponent
      },
      {
        path: '',
        redirectTo: '/dashboard/stats',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
