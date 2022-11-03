import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsPageRoutingModule } from './notifications-routing.module';

import { NotificationsPage } from './notifications.page';
import {DashboardPageRoutingModule} from "../dashboard/dashboard-routing.module";
import {SharedModule} from "../../helpers/shared.module";
import {MessagesListComponent} from "../../components/messages-list/messages-list.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    SharedModule
  ],
    declarations: [NotificationsPage, MessagesListComponent]
})
export class NotificationsPageModule {}
