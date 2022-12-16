import {Component, OnInit} from '@angular/core';
import {EnquiryService} from "../../services/enquiry.service";
import {StepAnswer} from "../../models/Step";
import { TranslationService } from 'src/app/services/translation.service';
import {Enquiry} from "../../models/Enquiry";
import {
    getARequestStateColor, getARequestStateLabel,
    printReadableDate,
    printReadableDateComparedToDelay,
    getARemoteResourcePath
} from "../../helpers/helpers.functions";
import {Service} from "../../models/Service";
import {User} from "../../models/User";
import {ServiceProvider} from "../../models/ServiceProvider";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthStateService} from "../../services/auth-state.service";
import {ScreenService} from "../../services/screen.service";
import {State} from "../../models/Filter";
import {ModalController} from "@ionic/angular";
import {ServiceProviderRequestApprobationComponent} from "../service-provider-request-approbation/service-provider-request-approbation.component";

@Component({
  selector: 'app-enquiry-details',
  templateUrl: './enquiry-details.component.html',
  styleUrls: ['./enquiry-details.component.scss'],
})
export class EnquiryDetailsComponent implements OnInit {

  enquiryCode: string = '';
  enquiryData: Enquiry | null = null;
  enquiryAnswers: StepAnswer[] = [];
  enquiryService: Service | null = null;
  enquiryUser: User | null = null;
  enquiryProvider: ServiceProvider | null;
  user !: User;

  hasLoadedUserData: boolean | null = null;
  hasLoadedEnquiryData: boolean | null = null;

  isProcessing = false;
  currentAction: string = 'cancellation';

  providerNote: number = 0;

  constructor(
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private authStateService: AuthStateService,
      private _enquiryService: EnquiryService,
      private translationService: TranslationService,
      private screenService: ScreenService,
      private modalController: ModalController,
  ) {
    this.enquiryCode = this.activatedRoute.snapshot.paramMap.get('code');
    console.log(this.enquiryCode)
  }

  get arrayAnswers(){
    return this.enquiryAnswers.filter(elt => elt.is_array);
  }

  get simpleAnswers(){
    return this.enquiryAnswers.filter(elt => !elt.is_array);
  }

  get canCancel(){
    return this.enquiryData && this.enquiryData.state !== State.CREATED;
  }

  get canNegotiate(){
    return this.enquiryData && this.enquiryData.state !== State.CREATED && this.enquiryData.state !== State.APPROVED;
  }

  get canApprove(){
    return this.enquiryData && ((this.enquiryData.state !== State.CREATED && this.enquiryData.state !== State.APPROVED) && (this.enquiryData.provider_price && this.enquiryData.provider_intervention_date));
  }

  get canNoteProvider(){
    return this.enquiryData && ((this.enquiryData.state === State.APPROVED) && (new Date().getTime() > (new Date(this.enquiryData.final_intervention_date).getTime() + (1000*60*30))));
  }

  label(item: any){
    return (this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en) ?? '';
  }

  value(item: any){
    return (this.translationService.getCurrentLang() === 'fr' ? item.value : item.value) ?? '';
  }

  printDate(date: Date | string, withDelay: boolean = false)
  {
    date = typeof date === 'string' ? new Date(date) : date;
    return !withDelay ? printReadableDate(date, this.translationService.getCurrentLang(), true, true)
          : printReadableDateComparedToDelay(date, this.translationService.getCurrentLang());
  }

  enquiryStateColor(state: number){
    return getARequestStateColor(state);
  }

  enquiryStateLabel(state: number){
    return this.translationService.getValueOf(getARequestStateLabel(state, false));
  }

  getRemoteImage(path: string){
    return getARemoteResourcePath(path);
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll(){
    this.loadUserData();
    this.loadCurrentEnquiryData();
  }

  loadUserData()
  {
    this.hasLoadedUserData = null;

    this.authStateService.getUserData()
        .then((res) =>{
          this.user = res;
          this.hasLoadedUserData = true;
        })
        .catch((err) =>{
          console.error(err);
          this.hasLoadedUserData = false;
        });
  }

  loadCurrentEnquiryData(code: string = this.enquiryCode){
    this.hasLoadedEnquiryData = null;
    this._enquiryService.getAnEnquiryWithCode(code)
        .then((res: any) =>{
          console.log(res);
          let {service, answers, service_provider, user, ...data} = res;
          this.enquiryService = service;
          this.enquiryProvider = service_provider;
          this.enquiryUser = user;
          this.enquiryData = data;
          this.enquiryAnswers = JSON.parse(answers.content);

          this.hasLoadedEnquiryData = true;
        })
        .catch((err) =>{
          console.error(err);
          this.hasLoadedEnquiryData = false;
        });
  }

  askConfirmation(action: string){
    this.currentAction = action;
    let temp = action === 'cancellation' ? 'ENQUIRYACTIONS.ONABANDON1' : action === 'approbation' ? 'ENQUIRYACTIONS.ONAPPROVE1' : ' ';
    this.screenService.presentAlert({
      mode: "ios",
      message: this.translationService.getValueOf(temp),
      buttons: [
        {
          text: this.translationService.getValueOf('SUBMIT.NO'),
          role: 'cancel'
        },
        {
          text: this.translationService.getValueOf('SUBMIT.YES'),
          handler: () =>{
            if(action === 'cancellation'){
              this.onCancelRequest();
            }
            else if (action === 'approbation'){
              this.onApproveRequest()
            }
          }
        }
      ]
    });
  }

  onCancelRequest()
  {
    this.currentAction = 'cancellation';
    let newRequestData = {
      ...this.enquiryData,
      user_price: null,
      final_intervention_date: null,
      final_price: null,
      provider_intervention_date: null,
      provider_price: null,
      service_provider_id: null,
      state: State.CREATED
    }

    this.updateEnquiry(newRequestData);
  }

  updateEnquiry(newEnquiryData: any){
    this.isProcessing = true;
    this._enquiryService.updateAnEnquiry(this.enquiryData.id, newEnquiryData)
      .then((res: any) =>{
        console.log(res);
        this.enquiryData = {
          ...res.enquiry
        }
        if(this.currentAction === 'cancellation'){
          this.enquiryProvider = null;
        }

        let temp = '';
        switch(this.currentAction){
          case 'cancellation': {
            temp = 'ENQUIRYACTIONS.SUCCESSABANDON';
            break;
          }
          case 'resolution':{
            temp = 'ENQUIRYACTIONS.SUCCESSESOLUTION';
            break;
          }
          case 'approbation':{
            temp = 'ENQUIRYACTIONS.SUCCESSAPPROBATION';
            break;
          }
          default:{
            temp = 'ENQUIRYACTIONS.SUCCESSMAKEOFFER'
            break;
          }
        }
        this.isProcessing = false;
        this.screenService.presentToast({
          message: this.translationService.getValueOf(temp),
        });
      })
      .catch((err) =>{
        console.error(err);
        this.isProcessing = false;
        let temp = '';
        switch(this.currentAction){
          case 'cancellation': {
            temp = 'ENQUIRYACTIONS.ERRORABANDON';
            break;
          }
          case 'resolution':{
            temp = 'ENQUIRYACTIONS.ERRORRESOLUTION';
            break;
          }
          case 'approbation':{
            temp = 'ENQUIRYACTIONS.ERRORAPPROBATION';
            break;
          }
          default:{
            temp = 'ENQUIRYACTIONS.MAKEOFFERERROR'
            break;
          }
        }
        this.screenService.presentErrorAlert({
          mode: "ios",
          message: this.translationService.getValueOf(temp),
          buttons: ["OK"]
        });
      })
  }

  onApproveRequest(){
    this.currentAction = 'approbation';
    let newRequestData = {
      ...this.enquiryData,
      final_intervention_date: this.enquiryData.user_intervention_date,
      final_price: this.enquiryData.user_price,
      state: State.APPROVED
    }

    this.updateEnquiry(newRequestData);
  }

  async showNegotiationFormModal(){
    const modal = await this.modalController.create({
      component: ServiceProviderRequestApprobationComponent,
      componentProps: {
        'requestData': this.enquiryData,
        'isForProvider': false
      }
    });

    modal.onDidDismiss()
      .then((event) =>{
        console.log(event);
        if(event.data)
        {
          let temp = {
            ...this.enquiryData,
            state: State.IN_ATTENDANCE_OF_PROVIDER,
            user_intervention_date: event.data.date,
            user_price: ""+event.data.price,
          };
          this.currentAction = 'negotiation'
          this.updateEnquiry(temp);
        }
      })
    return await modal.present();
  }

  onNoteProvider(){
    let newEnquiryData = {
      ...this.enquiryData,
      state: State.RESOLVED,
      provider_rate: this.providerNote
    }

    this.currentAction = 'resolution';

    this.updateEnquiry(newEnquiryData);
  }


}
