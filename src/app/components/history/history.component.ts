import {Component, OnInit} from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {EnquiryService} from "../../services/enquiry.service";
import {User} from "../../models/User";
import {AuthStateService} from "../../services/auth-state.service";
import {CheckableItem} from "../../models/CheckableItem";
import {Enquiry} from "../../models/Enquiry";
import {
  getARequestStateColor,
  getARequestStateLabel,
  printReadableDate,
  printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {Filter, OrderDirection, OrderType, State} from "../../models/Filter";
import {Router} from "@angular/router";
import {ModalController} from "@ionic/angular";
import {EnquiryFilteringComponent} from "../enquiry-filtering/enquiry-filtering.component";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {

  hasLoadedEnquiries: boolean | null = null;
  userData!: User;

  enquiries: CheckableItem<Enquiry>[] = [];

  isSelecting = false;
  showSearchbar = false;
  searchedEnquiryCode: string = '';

  filter: Filter = {
    order_by: OrderType.CREATION_DATE,
    order_direction: OrderDirection.DESCENDANT,
    states: "",
    services: []
  }

  constructor(
    private translationService: TranslationService,
    private enquiryService: EnquiryService,
    private authStateService: AuthStateService,
    private router: Router,
    private modalController: ModalController,
    ) { }


  get canDelete(){
    return this.isSelecting && this.enquiries.filter(elt => elt.item.state === State.CREATED).length === this.enquiries.filter(elt => elt.checked).length;
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item?.label : item?.label_en;
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

  ngOnInit() {
    this.filterEnquiries();
  }

  onItemPressed(event){
    console.log(event);
  }

  loadEnquiries(otherParams: string = '', event: any = undefined){
    if(!event){
      this.hasLoadedEnquiries = null;
    }
    this.loadUserData()
      .then((user) =>{
        this.enquiryService.getAllUserEnquiries(user?.id, otherParams)
          .then((res: any) =>{
            console.log(res);
            this.initialiseChecks(res.data);
            if(!event){
              this.hasLoadedEnquiries = true;
            }
            else{
              event.target.complete()
            }
          })
          .catch((err) =>{
            console.error(err);
            if(!event){
              this.hasLoadedEnquiries = false;
            }
            else{
              event.target.complete()
            }
          })
      })
  }

  filterEnquiries(event: any = undefined){
    let otherParams = '';
    if(this.searchedEnquiryCode !== ''){
      otherParams += ('&code='+this.searchedEnquiryCode);
    }

    if(this.filter.states !== '') {
      otherParams += ('&states=' + this.filter.states)
    }

    if(this.filter.services.length > 0){
      otherParams += ('&services=' + this.filter.services.join(','));
    }

    otherParams += ('&order_by=' + this.filter.order_by);
    otherParams += ('&order_direction=' + this.filter.order_direction);

    this.loadEnquiries(otherParams, event);
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
              reject('No user found !');
            }
            resolve(user);
          })
          .catch((err) =>{
            reject(err);
          });
      }
    }));
  }

  private initialiseChecks(enquiries: Enquiry[]){
    this.enquiries = [];
    enquiries.forEach((elt) =>{
      this.enquiries.push({
        item: elt,
        checked: false
      });
    })
  }

  onSelectItem(index: number){
    this.enquiries[index].checked = !this.enquiries[index]?.checked;
    this.isSelecting = !!this.enquiries.find(elt => elt.checked);
  }

  onClickItem(index: number){
    if(this.isSelecting){
      this.onSelectItem(index);
    }
    else{
      this.onViewEnquiryDetails(index);
    }
  }

  toggleSearchbar(){
    this.showSearchbar = !this.showSearchbar;
  }

  onViewEnquiryDetails(index: number){
    this.router.navigate(['history/'+this.enquiries[index].item.code]);
  }

  async showFilterModal(){
    const modal = await this.modalController.create({
      component: EnquiryFilteringComponent,
      componentProps: {
        'filter': this.filter,
        'isForProvider': false
      }
    });

    modal.onDidDismiss()
      .then((event) =>{
        console.log(event);
        if(event.data)
        {
          this.filter = event.data;
          this.filterEnquiries();
        }
      })
    return await modal.present();
  }
}
