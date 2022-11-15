import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {Filter, OrderDirection, OrderType, State} from "../../models/Filter";
import {getARequestStateLabel, getEnumValues} from "../../helpers/helpers.functions";
import {TranslationService} from "../../services/translation.service";
import {CategoryService} from "../../services/category.service";
import {Service, ServiceSelection} from "../../models/Service";

@Component({
  selector: 'app-enquiry-filtering',
  templateUrl: './enquiry-filtering.component.html',
  styleUrls: ['./enquiry-filtering.component.scss'],
})
export class EnquiryFilteringComponent implements OnInit {

  @Input() isForProvider: boolean = false;
  @Input() filter!: Filter;

  states = [];
  servicesList: ServiceSelection[] = [];

  orderTypes = [
    {
      label: 'ENQUIRYFILTERING.INTERVENTIONDATE',
      value: this.isForProvider ? OrderType.INTERVENTION_DATE2 : OrderType.INTERVENTION_DATE
    },
    {
      label: 'ENQUIRYFILTERING.CREATIONDATE',
      value: OrderType.CREATION_DATE
    }
  ];
  orderDirections = [
    {
      label: 'ENQUIRYFILTERING.ASCENDING',
      value: OrderDirection.ASCENDANT
    },
    {
      label: 'ENQUIRYFILTERING.DESCENDING',
      value: OrderDirection.DESCENDANT
    }
  ];

  checkAllStates: boolean = true;

  constructor(
    private modalController: ModalController,
    private translationService: TranslationService,
    private categoryService: CategoryService,
  ) { }

  get checkedServices(){
    let services = [];
    this.servicesList.filter((elt) => elt.parent.hasCheckedOneChild)
      .forEach((elt) =>{
        services = services.concat(elt.children.filter((child) => {
          console.log(child.isChecked)
          return child.isChecked
        }).map(elt => elt.id));
      });

    return services;
  }

  get parentServices(){
    let services = [];
    this.servicesList.filter((elt) => elt.parent.hasCheckedOneChild)
      .forEach((elt) =>{
        services = services.concat(elt.parent);
      });

    return services;
  }

  get childServices(){
    let services = [];
    this.servicesList.filter((elt) => elt.parent.hasCheckedOneChild)
      .forEach((elt) =>{
        services = services.concat(elt.children);
      });

    return services;
  }

  ngOnInit() {
    let checkedState = this.filter.states.split(',');
    getEnumValues(State).forEach((elt, index) =>{
      this.states.push({
        label: this.getStateLabel(elt),
        value: elt,
        isChecked: (this.filter.states === '') ? true : checkedState.includes(elt.toString())
      });
    });

    this.categoryService.getAllServices()
      .then((res: any) =>{
        this.servicesList = [];
        res.filter((elt: Service) => elt.parent_id === null)
          .forEach((elt: Service) =>{
            this.servicesList.push({
              parent: {...elt, hasCheckedAllChildren: false, hasCheckedOneChild: false},
              children: res.filter((child: Service) => child.parent_id === elt.id)
                .map((child: Service) => {
                  return {
                    ...child,
                    isChecked: this.filter.services.length > 0 ? this.filter.services.includes(child.id) : true
                  }
                })
            });
          });

        this.servicesList.forEach((elt, index, array) =>{
          let temp = elt.children.filter(child => child.isChecked);
          array[index] = {
            ...elt,
            parent: {
              ...elt.parent,
              hasCheckedOneChild: temp.length > 0,
              hasCheckedAllChildren: temp.length === elt.children.length,
            }
          }
        })
      })
      .catch((err) =>{
        console.error(err);
      });
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en;
  }

  getStateLabel(state: State){
    return this.translationService.getValueOf(getARequestStateLabel(state, this.isForProvider));
  }

  onStatesChange(isForAll: boolean = false, index: number = 0){
    if(!isForAll){
      let temp = this.states.filter((elt, i) => (index === i) ? !elt.isChecked : elt.isChecked)
        .map((elt) => elt.value).join(',');
      this.filter = {
        ...this.filter,
        states: temp
      }

      this.checkAllStates = temp.split(',').length === this.states.length;
      if(temp === ''){
        this.onStatesChange(true);
      }
    }
    else{
      this.checkAllStates = true;
      this.states.forEach((elt, index, array) =>{
        array[index] = {
          ...elt,
          isChecked: true
        }
      })
    }

    console.log(this.filter);
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onApply(shouldClear: boolean = false) {
    if(shouldClear){
      this.filter = {
        order_by: OrderType.CREATION_DATE,
        order_direction: OrderDirection.DESCENDANT,
        states: "",
        services: []
      }
    }
    this.modalController.dismiss(this.filter, 'confirm');
  }

  onCheckAllChildOfAService(serviceId: number){
    let duplicatedServicesList = [];
    this.servicesList.forEach((elt) =>{
      if(elt.parent.id === serviceId){
        duplicatedServicesList.push({
          parent: {...elt.parent, hasCheckedOneChild: true},
          children : elt.children.map((child) => {return {...child, isChecked: true}})
        });
      }
      else{
        duplicatedServicesList.push({...elt});
      }
    });
    this.syncChecks(duplicatedServicesList);
  }

  onChildServiceChange(parentId: number, serviceId: number)
  {
    let duplicatedServicesList = [];
    this.servicesList.forEach((elt) =>{
      if(elt.parent.id === parentId){
        let temp = elt.children.filter((child) => {
          return child.id === serviceId ? !child.isChecked : child.isChecked;
        });
        duplicatedServicesList.push({
          ...elt,
          parent: {
            ...elt.parent,
            hasCheckedOneChild: temp.length > 0,
            hasCheckedAllChildren: temp.length === elt.children.length,
          }
        });
      }
      else{
        duplicatedServicesList.push({...elt});
      }
    });

    this.syncChecks(duplicatedServicesList);
  }

  syncChecks(duplicatedServices: ServiceSelection[]){
    console.log(duplicatedServices)
    this.servicesList = duplicatedServices;
    let services = [];
    duplicatedServices.filter((elt) => elt.parent.hasCheckedOneChild)
      .forEach((elt) =>{
        services = services.concat(elt.children.filter((child) => {
          console.log(child.isChecked)
          return child.isChecked
        }).map(elt => elt.id));
      });

    if(services.length === 0){
      this.parentServices.forEach((elt) =>{
        this.onCheckAllChildOfAService(elt.id);
      });
    }
    else if(services.length === this.childServices.length){
      services = [];
    }

    this.filter = {
      ...this.filter,
      services: services
    }

    console.log(services)
    // console.log(services);
    // console.log(this.checkedServices)
  }

}
