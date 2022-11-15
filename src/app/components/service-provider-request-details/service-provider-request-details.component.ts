import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthStateService} from "../../services/auth-state.service";
import {User} from "../../models/User";
import { ServiceProviderService } from 'src/app/services/service-provider.service';
import {Enquiry} from "../../models/Enquiry";
import {Service} from "../../models/Service";
import {ServiceProvider} from "../../models/ServiceProvider";
import {StepAnswer} from "../../models/Step";
import {TranslationService} from "../../services/translation.service";
import {
  getARequestStateColor, getARequestStateLabel,
  printReadableDate,
  printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {ScreenService} from "../../services/screen.service";
import {State} from "../../models/Filter";
import {ModalController} from "@ionic/angular";
import {ServiceProviderRequestApprobationComponent} from "../service-provider-request-approbation/service-provider-request-approbation.component";
import {GeolocationService} from "../../services/geolocation.service";
import {EnquiryMapLocationComponent} from "../enquiry-map-location/enquiry-map-location.component";

@Component({
  selector: 'app-service-provider-request-details',
  templateUrl: './service-provider-request-details.component.html',
  styleUrls: ['./service-provider-request-details.component.scss'],
})
export class ServiceProviderRequestDetailsComponent implements OnInit {

  requestCode: string = '';
  requestData: Enquiry | null = null;
  requestAnswers: StepAnswer[] = [];
  requestService: Service | null = null;
  requestUser: User | null = null;
  requestProvider: ServiceProvider | null;
  request: Enquiry | null = null;
  user !: User;

  hasLoadedUserData: boolean | null = null;
  hasLoadedRequestData: boolean | null = null;

  isProcessing = false;
  currentAction: string = 'cancellation';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authStateService: AuthStateService,
    private serviceProviderService: ServiceProviderService,
    private translationService: TranslationService,
    private screenService: ScreenService,
    private modalController: ModalController,
    private geolocationService: GeolocationService
  ) {
    this.requestCode = this.activatedRoute.snapshot.paramMap.get('code');
    console.log(this.requestCode)
  }

  get arrayAnswers(){
    return this.requestAnswers.filter(elt => elt.is_array);
  }

  get simpleAnswers(){
    return this.requestAnswers.filter(elt => !elt.is_array);
  }

  get canCancel(){
    return this.requestData && this.requestData.state !== State.CREATED;
  }

  get canNegotiate(){
    return this.requestData && this.requestData.state !== State.APPROVED;
  }

  get canApprove(){
    return this.requestData && (this.requestData.state !== State.CREATED && this.requestData.user_price && this.requestData.user_intervention_date);
  }

  label(item: any){
    return (this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en) ?? 'value';
  }

  value(item: any){
    return (this.translationService.getCurrentLang() === 'fr' ? item.value : item.value) ?? 'value';
  }

  printDate(date: Date | string, withDelay: boolean = false)
  {
    date = typeof date === 'string' ? new Date(date) : date;
    return !withDelay ? printReadableDate(date, this.translationService.getCurrentLang(), true, true)
      : printReadableDateComparedToDelay(date, this.translationService.getCurrentLang());
  }

  requestStateColor(state: number){
    return getARequestStateColor(state);
  }

  requestStateLabel(state: number){
    return this.translationService.getValueOf(getARequestStateLabel(state, true));
  }

  ngOnInit() {
    this.loadAll();
    this.geolocationService.getCurrentLocation()
      .then((res) =>{
        console.log(res);
      })
      .catch((err) =>{
        console.error(err);
      });
  }

  loadAll(){
    this.loadUserData();
    this.loadCurrentRequestData();
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

  loadCurrentRequestData(code: string = this.requestCode){
    this.hasLoadedRequestData = null;
    this.serviceProviderService.getARequestWithCode(code)
      .then((res: any) =>{
        console.log(res);
        let {service, answers, service_provider, user, ...data} = res;
        this.request = res;
        this.requestService = service;
        this.requestProvider = service_provider;
        this.requestUser = user;
        this.requestData = data;
        this.requestAnswers = JSON.parse(answers.content);

        this.hasLoadedRequestData = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedRequestData = false;
      });
  }

  askConfirmation(action: string){
    this.currentAction = action;
    let temp = action === 'cancellation' ? 'ENQUIRYACTIONS.ONABANDON2' : action === 'approbation' ? 'ENQUIRYACTIONS.ONAPPROVE2' : ' ';
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
      ...this.requestData,
      user_price: null,
      final_intervention_date: null,
      final_price: null,
      provider_intervention_date: null,
      provider_price: null,
      service_provider_id: null,
      state: State.CREATED
    }

    this.updateRequest(newRequestData);
  }

  updateRequest(newRequestData: any){
    this.isProcessing = true;
    this.serviceProviderService.updateARequest(this.requestData.id, newRequestData)
      .then((res: any) =>{
        console.log(res);
        this.requestData = {
          ...res.enquiry
        }
        if(this.currentAction === 'cancellation'){
          this.requestProvider = null;
        }
        this.isProcessing = false;
        let temp = this.currentAction === 'cancellation' ? 'ENQUIRYACTIONS.SUCCESSABANDON' : this.currentAction === 'approbation' ? 'ENQUIRYACTIONS.SUCCESSAPPROBATION' : 'ENQUIRYACTIONS.SUCCESSMAKEOFFER';
        this.screenService.presentToast({
          message: this.translationService.getValueOf(temp)
        });
      })
      .catch((err) =>{
        console.error(err);
        this.isProcessing = false;
        let temp = this.currentAction === 'cancellation' ? 'ENQUIRYACTIONS.ERRORABANDON' : this.currentAction === 'approbation' ? 'ENQUIRYACTIONS.ERRORAPPROBATION' : 'ENQUIRYACTIONS.MAKEOFFERERROR';
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
      ...this.requestData,
      service_provider_id: this.user?.provider?.id,
      final_intervention_date: this.requestData.user_intervention_date,
      final_price: this.requestData.user_price,
      state: State.APPROVED
    }

    this.updateRequest(newRequestData);
  }

  async showNegotiationFormModal(){
    const modal = await this.modalController.create({
      component: ServiceProviderRequestApprobationComponent,
      componentProps: {
        'requestData': this.request,
        'isForProvider': true
      }
    });

    modal.onDidDismiss()
      .then((event) =>{
        console.log(event);
        if(event.data)
        {
          let temp = {
            ...this.requestData,
            service_provider_id: this.user?.provider?.id,
            state: State.IN_ATTENDANCE_OF_CUSTOMER,
            provider_intervention_date: event.data.date,
            provider_price: ""+event.data.price,
          };

          this.updateRequest(temp);
        }
      })
    return await modal.present();
  }

  async showMapLocationModal(){
    const modal = await this.modalController.create({
      component: EnquiryMapLocationComponent
    });

    modal.onDidDismiss()
      .then((event) =>{

      })
    return await modal.present();
  }

}
