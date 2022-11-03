import { Component, OnInit } from '@angular/core';
import { ServiceProviderService } from 'src/app/services/service-provider.service';
import {AuthStateService} from "../../services/auth-state.service";
import {User} from "../../models/User";
import {Statistic} from "../../models/Statistic";
import {
  getANumberAbbreviation,
  getARequestStateLabel,
  getARequestStateLabelForStatistics
} from "../../helpers/helpers.functions";
import {State} from "../../models/Filter";
import {TranslationService} from "../../services/translation.service";

@Component({
  selector: 'app-service-provider-stats',
  templateUrl: './service-provider-stats.component.html',
  styleUrls: ['./service-provider-stats.component.scss'],
})
export class ServiceProviderStatsComponent implements OnInit {

  hasLoadedUserData: boolean | null = null;

  user!: User;

  showLegend: boolean = false;

  statistics: Statistic[] = [];
  pieChartOptions = {
    gradient: true,
    showLegend: true,
    showLabels: true,
    isDoughnut: false,
    legendPosition: 'below',
    view: [window.innerWidth, 400],
    colorScheme : {
      domain: ['#b1a398', '#eb445a', '#ffc409', '#2fdf75']
    }
  }

  constructor(
    private authStateService: AuthStateService,
    private serviceProviderService: ServiceProviderService,
    private translationService: TranslationService
  ) { }

  get statisticsPieChart(){
    let result = [];
    this.statistics.forEach((elt) =>{
      if(elt.state !== State.IN_ATTENDANCE_OF_PROVIDER && elt.state !== State.IN_ATTENDANCE_OF_CUSTOMER){
        if(elt?.total1 && elt?.total2){
          result.push({
            name: this.translationService.getValueOf(getARequestStateLabelForStatistics(elt.state, 'client')),
            value: elt.total1
          });
          result.push({
            name: this.translationService.getValueOf(getARequestStateLabelForStatistics(elt.state, 'provider')),
            value: elt.total2
          });
        }
        else{
          result.push({
            name: this.translationService.getValueOf(getARequestStateLabelForStatistics(elt.state)),
            value: elt.total
          });
        }
      }
    });

    return result.sort((a, b) => (a.state - b.state));
  }

  ngOnInit() {
    this.loadUserData();
  }

  getAStateRequestsNumber(state: number, totalIndex: number = 0){
    let temp = this.statistics.find(elt => elt.state === state);
    let value = 0;

    if(temp){
      if(totalIndex !== 0){
        value = temp['total'+totalIndex] ?? 0;
      }
      else{
        value = temp.total;
      }
    }
    else{
      value = 0;
    }

    return getANumberAbbreviation(value);
  }

  loadUserData(){
    this.hasLoadedUserData = null;
    this.authStateService.getUserData()
      .then((userData) =>{
        this.user = userData ?? null;
        console.log(this.user)
        this.hasLoadedUserData = !!this.user;
        this.loadProviderStatistics();
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedUserData = false;
      });
  }

  loadProviderStatistics(){
    this.serviceProviderService.getAServiceProviderStatistics(this.user?.provider?.id)
      .then((res: any) =>{
        this.statistics = res;
        Object.assign(this, this.statisticsPieChart);
        console.log(res);
      })
      .catch((err) =>{
        console.error(err);
      });
  }

}
