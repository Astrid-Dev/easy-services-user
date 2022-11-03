import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainTabsBarPageRoutingModule } from './main-tabs-bar-routing.module';

import { MainTabsBarPage } from './main-tabs-bar.page';
import {DashboardPageRoutingModule} from "../pages/dashboard/dashboard-routing.module";
import {SharedModule} from "../helpers/shared.module";
import {HistoryComponent} from "../components/history/history.component";
import {EnquiriesPageModule} from "../pages/enquiries/enquiries.module";
import {EnquiryFilteringComponent} from "../components/enquiry-filtering/enquiry-filtering.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainTabsBarPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    EnquiriesPageModule
  ],
    declarations: [MainTabsBarPage, HistoryComponent, EnquiryFilteringComponent]
})
export class MainTabsBarPageModule {}
