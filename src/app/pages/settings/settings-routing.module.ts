import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';
import { AccountComponent } from '../../components/account/account.component';
import {UpdatePasswordComponent} from "../../components/update-password/update-password.component";

const routes: Routes = [
  {
    path: '',
    // component: SettingsPage,
    children: [
      {
        path: 'account',
        component: AccountComponent
      },
      {
        path: 'update-password',
        component: UpdatePasswordComponent
      },
      {
        path: '',
        component: SettingsPage
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
