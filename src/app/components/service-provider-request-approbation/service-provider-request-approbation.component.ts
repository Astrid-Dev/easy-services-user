import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IonModal, ModalController} from "@ionic/angular";
import {Enquiry} from "../../models/Enquiry";
import {TranslationService} from "../../services/translation.service";
import {
  getAMaxDateIntervention,
  getAMinDateIntervention,
  printReadableDate,
  workHoursList
} from "../../helpers/helpers.functions";
import {OverlayEventDetail} from "@ionic/core/components";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {State} from "../../models/Filter";

const PRICE_STEP = 1000;
const MAX_PRICE = 999999999;
const MIN_PRICE = 1000;
const MODAL_ID = 'approbationModal';

@Component({
  selector: 'app-service-provider-request-approbation',
  templateUrl: './service-provider-request-approbation.component.html',
  styleUrls: ['./service-provider-request-approbation.component.scss'],
})
export class ServiceProviderRequestApprobationComponent implements OnInit {

  @Input() requestData: Enquiry | null = null;
  @Input() isForProvider: boolean = true;

  minDate: string | null = null;
  maxDate: string | null = null;
  approbationForm!: FormGroup;

  hoursList = workHoursList;

  showLoader: boolean = false;

  constructor(
    private translationService: TranslationService,
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.approbationForm = this.formBuilder.group({
      date: [null, [Validators.required]],
      price: [null, [Validators.required, Validators.maxLength(9)]]
    });

    this.approbationForm.controls.price.valueChanges
      .subscribe((value) =>{
        value = value ? value : 0;
        if(value < MIN_PRICE){
          this.approbationForm.controls.price.setValue(MIN_PRICE);
        }
        else if(value > MAX_PRICE){
          this.approbationForm.controls.price.setValue(MAX_PRICE);
        }
      });
  }

  get incomingDate()
  {
    let temp = this.isForProvider ? new Date(this.requestData.user_intervention_date) : new Date(this.requestData.provider_intervention_date);
    return printReadableDate(temp, this.translationService.getCurrentLang(), true, true);
  }

  get incomingDateLabel(){
    return this.translationService.getValueOf(this.isForProvider ? 'REQUESTAPPROBATION.PROVIDERDATE' : 'REQUESTAPPROBATION.CUSTOMERDATE');
  }

  get incomingPrice(){
    return this.isForProvider ? this.requestData.user_price : this.requestData.provider_price;
  }

  get incomingPriceLabel(){
    return this.translationService.getValueOf(this.isForProvider ? 'REQUESTAPPROBATION.PROVIDERPRICE' : 'REQUESTAPPROBATION.CUSTOMERPRICE');
  }

  ngOnInit() {

    this.setDates();
    this.setPrice();
  }

  setDates()
  {
    this.minDate = getAMinDateIntervention() as string;
    this.maxDate = getAMaxDateIntervention() as string;
    let temp = this.minDate;
    let currentTime = new Date(this.minDate).getTime();
    let providerTime = new Date(this.requestData.provider_intervention_date).getTime();
    let userTime = new Date(this.requestData.user_intervention_date).getTime();
    let minDateTime = new Date(this.minDate).getTime();
    if(this.isForProvider)
    {
      if(this.requestData.state === State.CREATED)
      {
        if(userTime > minDateTime){
          temp = this.requestData.user_intervention_date;
        }
      }
      else if(providerTime > minDateTime){
        temp = this.requestData.provider_intervention_date;
      }
    }
    else {
      if(this.requestData.state !== State.CREATED)
      {
        if(userTime > minDateTime){
          temp = this.requestData.user_intervention_date;
        }
        else if(providerTime > minDateTime){
          temp = this.requestData.provider_intervention_date;
        }
      }
    }

    this.approbationForm.controls.date.setValue(temp);
  }

  setPrice()
  {
    this.approbationForm.controls.price.setValue(this.isForProvider ? this.requestData.provider_price : this.requestData.user_intervention_date);
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  increasePrice()
  {
    let temp = this.approbationForm.value.price ? parseInt(this.approbationForm.value.price): 0;
    temp = (temp + PRICE_STEP) < MAX_PRICE ? (temp + PRICE_STEP) : MAX_PRICE;
    this.approbationForm.controls.price.setValue(temp);
  }

  decreasePrice()
  {
    let temp = this.approbationForm.value.price ? parseInt(this.approbationForm.value.price): 0;
    temp = (temp - PRICE_STEP) > MIN_PRICE ? (temp - PRICE_STEP) : MIN_PRICE;
    this.approbationForm.controls.price.setValue(temp);
  }

  onSubmit(){
    this.modalController.dismiss({
      price: this.approbationForm.value.price,
      date: this.approbationForm.value.date
    }, 'confirm');
  }
}
