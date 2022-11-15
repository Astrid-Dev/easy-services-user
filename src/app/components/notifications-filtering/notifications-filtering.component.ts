import {Component, Input, OnInit} from '@angular/core';
import {NotificationsFilter, NotificationState, OrderDirection, Period} from "../../models/Filter";
import {ModalController} from "@ionic/angular";
import {TranslationService} from "../../services/translation.service";
import {getAMaxDateIntervention, getAMinDateIntervention, parseDateToISOFormat} from "../../helpers/helpers.functions";

@Component({
  selector: 'app-notifications-filtering',
  templateUrl: './notifications-filtering.component.html',
  styleUrls: ['./notifications-filtering.component.scss'],
})
export class NotificationsFilteringComponent implements OnInit {

  @Input() filter!: NotificationsFilter;

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

  states = [
    {
      label: 'Lu',
      value: NotificationState.READED,
      checked: true
    },
    {
      label: 'Non Lu',
      value: NotificationState.UNREADED,
      checked: true
    }
  ];

  startingDate = null;
  endingDate = null;

  constructor(private modalController: ModalController, private translationService: TranslationService) { }

  get canSubmit(){
    return new Date(this.endingDate).getTime() >= new Date(this.startingDate).getTime();
  }

  ngOnInit() {
    this.setDates();
    this.states.forEach((elt, index, array) =>{
      if(elt.value === NotificationState.UNREADED){
        array[index] = {
          ...elt,
          checked: this.filter.state === NotificationState.ALL || this.filter.state === NotificationState.UNREADED
        }
      }
      else if(elt.value === NotificationState.READED){
        array[index] = {
          ...elt,
          checked: this.filter.state === NotificationState.ALL || this.filter.state === NotificationState.READED
        }
      }
    });
  }


  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onApply(shouldClear: boolean = false) {
    if(shouldClear){
      this.filter = {
        order_direction: OrderDirection.DESCENDANT,
        period: Period.ALL,
        state: NotificationState.ALL
      }
    }
    else{
      let hasUncheckedAll = true;
      let checkedStates = 0;
      let state = NotificationState.ALL;

      for(let i = 0; i < this.states.length; i++){
        if(this.states[i].checked){
          hasUncheckedAll = false;
          state = this.states[i].value;
          checkedStates++;
        }
      }

      if(checkedStates === this.states.length || hasUncheckedAll){
        state = NotificationState.ALL;
      }

      this.filter = {
        ...this.filter,
        order_direction: OrderDirection.DESCENDANT,
        state: state
      }

      if(this.filter.period === Period.CUSTOM){
        this.filter = {
          ...this.filter,
          starting_date: this.startingDate,
          ending_date: this.endingDate
        }
      }
    }

    this.modalController.dismiss(this.filter, 'confirm');
  }

  onStateChange(index: number){
    let hasUncheckedAll = true;
    console.log(this.states)
    for(let i = 0; i < this.states.length; i++){
      let checked = index === i ? !this.states[i].checked : this.states[i].checked;
      if(checked){
        hasUncheckedAll = false;
        break;
      }
    }

    if(hasUncheckedAll){
      this.states.forEach((elt, index, array) =>{
        array[index] = {
          ...elt,
          checked: true
        }
      });
    }
  }

  setDates(){
    let temp = new Date().getTime() - (2 * 30 * 24 * 60 * 60 * 1000);
    this.startingDate = parseDateToISOFormat(new Date(temp));
    this.endingDate = parseDateToISOFormat(new Date());
  }

}
