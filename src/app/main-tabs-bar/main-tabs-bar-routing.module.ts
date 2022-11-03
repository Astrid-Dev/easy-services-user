import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainTabsBarPage } from './main-tabs-bar.page';
import {HomeComponent} from '../components/home/home.component';
import {HistoryComponent} from '../components/history/history.component';
import {EnquiryDetailsComponent} from "../components/enquiry-details/enquiry-details.component";

const routes: Routes = [
  {
    path: '',
    component: MainTabsBarPage,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'notifications',
        loadChildren: () => import('../pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
      },
      {
        path: 'history',
        component: HistoryComponent
      },
      {
        path: 'history/:code',
        component: EnquiryDetailsComponent
      },
      {
        path: 'settings',
        loadChildren: () => import('../pages/settings/settings.module').then( m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainTabsBarPageRoutingModule {}
