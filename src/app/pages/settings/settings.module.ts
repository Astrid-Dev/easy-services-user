import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import {SharedModule} from '../../helpers/shared.module';
import { AccountComponent } from 'src/app/components/account/account.component';
import {UpdatePasswordComponent} from "../../components/update-password/update-password.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    SharedModule
  ],
  declarations: [SettingsPage, AccountComponent, UpdatePasswordComponent]
})
export class SettingsPageModule {}
