import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {Filter, OrderDirection, OrderType, State} from "../../models/Filter";
import {getARequestStateLabel, getEnumValues} from "../../helpers/helpers.functions";
import {TranslationService} from "../../services/translation.service";

@Component({
  selector: 'app-enquiry-filtering',
  templateUrl: './enquiry-filtering.component.html',
  styleUrls: ['./enquiry-filtering.component.scss'],
})
export class EnquiryFilteringComponent implements OnInit {

  @Input() isForProvider: boolean = false;
  @Input() filter!: Filter;

  states = []

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

  constructor(private modalController: ModalController, private translationService: TranslationService) { }

  ngOnInit() {
    let checkedState = this.filter.states.split(',');
    getEnumValues(State).forEach((elt, index) =>{
      this.states.push({
        label: this.getStateLabel(elt),
        value: elt,
        isChecked: (this.filter.states === '') ? true : checkedState.includes(elt.toString())
      });
    });
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
        states: ""
      }
    }
    this.modalController.dismiss(this.filter, 'confirm');
  }

}
