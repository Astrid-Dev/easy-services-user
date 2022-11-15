import {Component, OnInit} from '@angular/core';
import {User} from "../../models/User";
import {CheckableItem} from "../../models/CheckableItem";
import {Enquiry} from "../../models/Enquiry";
import {TranslationService} from "../../services/translation.service";
import {AuthStateService} from "../../services/auth-state.service";
import {
  getARequestStateColor, getARequestStateLabel,
  printReadableDate,
  printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {ServiceProviderService} from "../../services/service-provider.service";
import {Router} from "@angular/router";
import {Filter, OrderDirection, OrderType} from "../../models/Filter";
import {ModalController} from "@ionic/angular";
import {EnquiryFilteringComponent} from "../enquiry-filtering/enquiry-filtering.component";

@Component({
  selector: 'app-service-provider-requests',
  templateUrl: './service-provider-requests.component.html',
  styleUrls: ['./service-provider-requests.component.scss'],
})
export class ServiceProviderRequestsComponent implements OnInit {

  hasLoadedRequests: boolean | null = null;
  userData!: User;

  requests: Enquiry[] = [];

  showSearchbar = false;
  searchedRequestCode: string = "";

  filter: Filter = {
    order_by: OrderType.CREATION_DATE,
    order_direction: OrderDirection.DESCENDANT,
    states: "",
    services: []
  }

  constructor(
    private translationService: TranslationService,
    private serviceProviderService: ServiceProviderService,
    private authStateService: AuthStateService,
    private router: Router,
    private modalController: ModalController,
  ) { }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item?.label : item?.label_en;
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
    this.loadRequests();
  }

  loadRequests(otherParams: {key: string, value: string | number}[] = null, event: any = undefined){
    if(!event) {
      this.hasLoadedRequests = null;
    }
    this.loadUserData()
      .then((user) =>{
        this.serviceProviderService.getAServiceProviderRequests(user.provider?.id, otherParams)
          .then((res: any) =>{
            console.log(res);
            this.requests = res.data;
            if(!event) {
              this.hasLoadedRequests = true;
            }
            else{
              event.target.complete();
            }
          })
          .catch((err) =>{
            console.error(err);
            if(!event){
              this.hasLoadedRequests = false;
            }
            else{
              event.target.complete();
            }
          })
      })
  }

  filterRequests(event: any = undefined){
    let otherParams = [];
    if(this.searchedRequestCode !== '') {
      otherParams.push({
        key: 'code',
        value: this.searchedRequestCode
      });
    }
    if(this.filter.states !== '') {
      otherParams.push({
        key: 'states',
        value: this.filter.states
      });
    }
    if(this.filter.services.length > 0) {
      otherParams.push({
        key: 'services',
        value: this.filter.services.join(',')
      });
    }

    otherParams.push(
      {
        key: 'order_by',
        value: this.filter.order_by
      },
      {
        key: 'order_direction',
        value: this.filter.order_direction
      }
    );

    this.loadRequests(otherParams, event);
  }

  private loadUserData(){
    return new Promise<any>(((resolve, reject) => {
      if(this.userData){
        resolve(this.userData);
      }
      else{
        this.authStateService.getUserData()
          .then((user) =>{
            this.userData = user ?? null;
            if(!user){
              reject("No user found !");
            }
            resolve(user);
          })
          .catch((err) =>{
            reject(err);
          });
      }
    }));
  }

  toggleSearchbar(){
    this.showSearchbar = !this.showSearchbar;
  }

  onViewRequestDetails(request: Enquiry){
    this.router.navigate(['dashboard/requests/'+request.code])
  }

  async showFilterModal(){
    const modal = await this.modalController.create({
      component: EnquiryFilteringComponent,
      componentProps: {
        'filter': this.filter,
        'isForProvider': true
      }
    });

    modal.onDidDismiss()
      .then((event) =>{
        console.log(event);
        if(event.data)
        {
          this.filter = event.data;
          console.log(this.filter)
          this.filterRequests();
        }
      })
    return await modal.present();
  }

}
