import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnquiriesPageRoutingModule } from './enquiries-routing.module';

import { EnquiriesPage } from './enquiries.page';
import {NewEnquiryComponent} from "../../components/new-enquiry/new-enquiry.component";
import { SharedModule } from 'src/app/helpers/shared.module';
import {EnquiryDetailsComponent} from "../../components/enquiry-details/enquiry-details.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnquiriesPageRoutingModule,
    SharedModule
  ],
  exports: [
    EnquiryDetailsComponent
  ],
  declarations: [EnquiriesPage, EnquiryDetailsComponent]
})
export class EnquiriesPageModule {}
