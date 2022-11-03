/* eslint-disable @typescript-eslint/naming-convention */
import {Component, OnInit, ViewChild} from '@angular/core';
import SwiperCore, {SwiperOptions, EffectFade} from 'swiper';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SwiperComponent} from 'swiper/angular';
import {IonContent} from '@ionic/angular';
import {
  getAMaxDateIntervention,
  getAMinDateIntervention,
  workHoursList
} from '../../helpers/helpers.functions';
import { EnquiryService } from '../../services/enquiry.service';
import { ServiceStructure } from 'src/app/models/Service';
import { Service } from '../../models/Service';
import { TranslationService } from '../../services/translation.service';
import { ScreenService } from '../../services/screen.service';
import {StepAnswer, StepQuestion} from 'src/app/models/Step';
import {Enquiry} from "../../models/Enquiry";
import {Router} from "@angular/router";
import {User} from "../../models/User";
import {AuthStateService} from "../../services/auth-state.service";
import {GeolocationService} from "../../services/geolocation.service";

SwiperCore.use([EffectFade]);

@Component({
  selector: 'app-new-enquiry',
  templateUrl: './new-enquiry.component.html',
  styleUrls: ['./new-enquiry.component.scss'],
})
export class NewEnquiryComponent implements OnInit {

  @ViewChild('swiperRef', { static: false }) swiper?: SwiperComponent;
  @ViewChild('ionContent', {static: false}) content?: IonContent;

  config: SwiperOptions = {
    slidesPerView: 3,
    spaceBetween: 50,
    navigation: false,
    effect: 'fade',
  };

  enquiryDetailsForm !: FormGroup;
  dateAndLocationForm !: FormGroup;
  contactsDetailsForm !: FormGroup;

  user!: User;
  hasLoadedServices: boolean | null = null;
  hasLoadedUserData: boolean | null = null;
  hasSelectedService = false;
  selectedService: number | null = null;
  isLoadingServiceQuestions = false;
  isLocalising: boolean = false;
  isCreatingEnquiry = false;

  servicesList: ServiceStructure[] = [];
  serviceQuestions: StepQuestion[] = [];

  steps = [1, 2, 3, 4];

  minDate = '';
  maxDate = '';
  hoursList: number[] = workHoursList;

  currentSlide = 0;

  enquiryCode: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private enquiryService: EnquiryService,
    private translationService: TranslationService,
    private screenService: ScreenService,
    private router: Router,
    private authStateService: AuthStateService,
    private geolocationService: GeolocationService
    ) {
    this.enquiryDetailsForm = this.formBuilder.group({});

    this.dateAndLocationForm = this.formBuilder.group({
      date: [null, [Validators.required]],
      longitude: [null, [Validators.required]],
      latitude: [null, [Validators.required]],
      address: [null, [Validators.required]]
    });

    this.contactsDetailsForm = this.formBuilder.group({
      names: [null, [Validators.required]],
      phone_number: [null, [Validators.required, Validators.minLength(9), Validators.maxLength(18)]],
      email: [null, [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }

  get canGoForward(){
    if(this.currentSlide === 1) {
      return this.enquiryDetailsForm.valid;
    }
    else if(this.currentSlide === 2) {
      return this.dateAndLocationForm.valid;
    }
    return false;
  }

  get canGoBack()
  {
    return (this.currentSlide > 0 && this.currentSlide < 3);
  }

  get canShowBackButton()
  {
    return this.currentSlide > 0 && this.currentSlide < 3;
  }

  get canShowNextButton()
  {
    return this.currentSlide > 0 && this.currentSlide < 2;
  }

  get canShowSubmitButton()
  {
    return this.currentSlide === 2;
  }

  get canShowEndButton()
  {
    return this.currentSlide === 3;
  }

  get canSubmitForm(){
    return this.hasSelectedService && this.enquiryDetailsForm.valid && this.dateAndLocationForm.valid;
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll(){
    if(!this.hasLoadedUserData){
      this.loadUserData();
    }

    if(!this.hasLoadedServices){
      this.loadServices();
    }
  }

  loadUserData(){
    this.hasLoadedUserData = null;
    this.authStateService.getUserData()
      .then((userData) =>{
        this.user = userData ?? null;
        this.hasLoadedUserData = !!this.user;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedUserData = false;
      });
  }

  loadServices(){
    this.hasLoadedServices = null;

    this.enquiryService.getAllServices()
      .then((res: any) =>{
        this.servicesList = [];
        res.filter((elt: Service) => elt.parent_id === null)
          .forEach((elt: Service) =>{
            this.servicesList.push({
              parent: elt,
              children: res.filter((child: Service) => child.parent_id === elt.id)
            });
          });
        this.hasLoadedServices = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedServices = false;
      });
  }

  loadCurrentServiceQuestions(){
    this.isLoadingServiceQuestions = true;
    this.enquiryService.getAServiceQuestions(this.selectedService)
      .then((res: any) =>{
        console.log(res);
        this.isLoadingServiceQuestions = false;
        if(res === null){
          this.screenService.presentWarningAlert({
            mode: 'ios',
            message: this.translationService.getValueOf('NEWENQUIRY.NOQUESTIONS'),
            buttons: ['OK']
          });
        }
        else{

          try{
            this.serviceQuestions = JSON.parse(''+JSON.parse(res.content)) as StepQuestion[];
          }
          catch(error){
            this.serviceQuestions = JSON.parse(res.content) as StepQuestion[];
          }

          console.log(this.serviceQuestions);

          this.enquiryDetailsForm = this.formBuilder.group({});

          this.serviceQuestions.forEach((elt) =>{
            const formControl = new FormControl();
            if(elt?.required){
              formControl.addValidators(Validators.required);
            }
            if(elt?.minlength){
              formControl.addValidators(Validators.minLength(elt.minlength));
            }
            if(elt?.maxlength){
              formControl.addValidators(Validators.maxLength(elt.maxlength));
            }
            if(elt.type === 'email'){
              formControl.addValidators(Validators.email);
            }

            this.enquiryDetailsForm.addControl(elt.key, formControl);

            // if(elt.type === 'checkbox' && elt?.options){
            //   elt.options.forEach((child, index) =>{
            //     const childFormControl = new FormControl();
            //     if(elt?.required){
            //       childFormControl.addValidators(Validators.required);
            //     }

            //     this.enquiryDetailsForm.addControl((elt.key + '-'+index), childFormControl);
            //   });
            // }
          });
          console.log(this.enquiryDetailsForm.controls);

          // this.enquiryDetailsForm.valueChanges.subscribe((temp) =>{
          //   console.log(this.enquiryDetailsForm.controls);
          //   console.log(temp);
          // });

          this.currentSlide++;
          this.hasSelectedService = true;
          this.slideTo(this.currentSlide);
        }
      })
      .catch((err) =>{
        console.error(err);
        this.isLoadingServiceQuestions = false;
        this.screenService.presentErrorAlert({
          mode: 'ios',
          message: this.translationService.getValueOf('NEWENQUIRY.LOADINGQUESTIONSERROR'),
          buttons: ['OK']
        });
      });
  }

  onCheckboxesChange(key: string, event: any){
    let value = event.target.value;
    console.log(value);
    let previousValue = this.enquiryDetailsForm.controls[key].value ?? '';
    if(!previousValue.split("£").includes(value)){
      this.enquiryDetailsForm.controls[key].setValue((previousValue + '£' + value));
    }
    else{
      this.enquiryDetailsForm.controls[key].setValue(previousValue.split('£')
        .filter(elt => elt !== value).join('£'));
    }
  }

  setMinDate()
  {
    this.minDate = getAMinDateIntervention() as string;
    if(!this.dateAndLocationForm.controls.date.value || new Date(this.dateAndLocationForm.controls.date.value).getTime() < new Date(this.minDate).getTime()) {
      this.dateAndLocationForm.controls.date.setValue(this.minDate);
    }
  }

  setMaxDate(){
    this.maxDate = getAMaxDateIntervention() as string;
  }

  classNameOfSlide(slideIndex: number){
    return slideIndex <= this.currentSlide ? 'step-bubble active' : 'step-bubble';
  }

  classNameOfConnector(slideIndex: number){
    return slideIndex <= this.currentSlide ? 'step-connector active' : 'step-connector';
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en;
  }

  title(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.title : item.title_en;
  }

  goBack()
  {
    this.currentSlide--;
    this.slideTo(this.currentSlide);
  }

  goForward(){
    this.currentSlide++;
    this.slideTo(this.currentSlide);
  }

  slideTo(index: number) {
    this.setMaxDate();
    this.setMinDate();
    this.swiper.swiperRef.slideTo(index, 300);
    this.content.scrollToTop(100);
  }

  onFormSubmit(){
    let answers: StepAnswer[] = [];

    this.isCreatingEnquiry = true;

    this.serviceQuestions.forEach((elt) =>{
      let value = null;
      if(elt.type === 'checkbox'){
        value = [];
        let formValue = this.enquiryDetailsForm.controls[elt.key].value;
        formValue.split("£").forEach((opt) =>{
          let temp = elt?.options.find(elt => elt.value === opt);
          if(temp){
            value.push({
              unique_value: opt,
              value: temp.label,
              value_en: temp.label_en
            });
          }
        });
        answers.push({
          is_array: elt.type === 'checkbox',
          label: elt.answer_label,
          label_en: elt.answer_label_en,
          values: value,
        })
      }
      else if(elt.type === 'radio')
      {
        value = this.enquiryDetailsForm.controls[elt.key].value;
        let temp = elt?.options.find(elt => elt.value === value);
        answers.push({
          is_array: false,
          label: elt.answer_label,
          label_en: elt.answer_label_en,
          value: temp?.label,
          value_en: temp?.label_en
        })
      }
      else{
        value = this.enquiryDetailsForm.controls[elt.key].value;
        answers.push({
          is_array: elt.type === 'checkbox',
          label: elt.answer_label,
          label_en: elt.answer_label_en,
          value: value,
          value_en: value
        })
      }
    });

    const data: Enquiry = {
      address: this.dateAndLocationForm.value.address,
      user_intervention_date: this.dateAndLocationForm.value.date,
      latitude: this.dateAndLocationForm.value.latitude,
      longitude: this.dateAndLocationForm.value.longitude,
      user_id: this.user.id,
      service_id: this.selectedService,
      answers: JSON.stringify(answers),
    }

    this.enquiryService.createAnEnquiry(data)
      .then((res: any) =>{
        console.log(res);
        this.enquiryCode = res.enquiry.code;
        this.isCreatingEnquiry = false;
        this.currentSlide++;
        this.slideTo(this.currentSlide);
      })
      .catch((err) =>{
        console.error(err);
        this.isCreatingEnquiry = false;
        this.screenService.presentErrorAlert({
          mode: 'ios',
          message: this.translationService.getValueOf('NEWENQUIRY.CREATIONERROR'),
          buttons: ['OK']
        });
      });
  }

  goToHistory(){
    this.currentSlide = 0;
    this.hasSelectedService = false;
    this.selectedService = null;
    this.router.navigate(["history"]);
  }

  loadUserLocation(){
    this.isLocalising = true;
    this.geolocationService.checkLocationPermission()
      .then((permission) =>{
        if(permission.location !== 'granted'){
          this.geolocationService.requestLocationPermission()
            .then((requestPermission) =>{
              if(requestPermission.location === 'granted'){
                this.getUserLocation();
              }
              else{
                this.onFailedToLoadUserLocation();
              }
            })
            .catch((err) =>{
              console.error(err);
              this.onFailedToLoadUserLocation();
            });
        }
        else{
          this.getUserLocation();
        }
      })
      .catch((err) =>{
        console.error(err);
        this.onFailedToLoadUserLocation();
      });
  }

  onFailedToLoadUserLocation(){
    this.isLocalising = false;
    this.screenService.presentErrorAlert({
      mode: 'ios',
      message: this.translationService.getValueOf('NEWENQUIRY.LOADINGLOCATIONERROR'),
      buttons: ['OK']
    });
  }

  getUserLocation(){
    this.geolocationService.getCurrentLocation()
      .then((res) =>{
        this.dateAndLocationForm.controls.latitude.setValue(res.coords.latitude);
        this.dateAndLocationForm.controls.longitude.setValue(res.coords.longitude);
        this.isLocalising = false;
      })
      .catch((err) =>{
        this.onFailedToLoadUserLocation();
      });
  }

}
