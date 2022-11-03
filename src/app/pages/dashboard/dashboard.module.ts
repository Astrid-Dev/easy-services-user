import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import {SharedModule} from "../../helpers/shared.module";
import {ServiceProviderRequestsComponent} from "../../components/service-provider-requests/service-provider-requests.component";
import {ServiceProviderCalendarComponent} from "../../components/service-provider-calendar/service-provider-calendar.component";
import {ServiceProviderProfileComponent} from "../../components/service-provider-profile/service-provider-profile.component";
import {ServiceProviderRequestDetailsComponent} from "../../components/service-provider-request-details/service-provider-request-details.component";
import {ServiceProviderRequestApprobationComponent} from "../../components/service-provider-request-approbation/service-provider-request-approbation.component";
import {ServiceProviderNotificationsComponent} from "../../components/service-provider-notifications/service-provider-notifications.component";
import {ServiceProviderStatsComponent} from "../../components/service-provider-stats/service-provider-stats.component";
import {EnquiryMapLocationComponent} from "../../components/enquiry-map-location/enquiry-map-location.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    SharedModule
  ],
  declarations: [
    DashboardPage,
    ServiceProviderRequestsComponent,
    ServiceProviderCalendarComponent,
    ServiceProviderProfileComponent,
    ServiceProviderRequestDetailsComponent,
    ServiceProviderRequestApprobationComponent,
    ServiceProviderNotificationsComponent,
    ServiceProviderStatsComponent,
    EnquiryMapLocationComponent
  ]
})
export class DashboardPageModule {}
