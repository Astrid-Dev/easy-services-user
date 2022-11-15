import { Component, OnInit } from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {NotificationService} from "../../services/notification.service";
import {Router} from "@angular/router";
import {
  getANumberAbbreviation,
  getARemoteResourcePath,
  getARequestStateNotificationDescription,
  getARequestStateNotificationImage,
  getARequestStateNotificationTitle, getRandomInt, printReadableDate, printReadableDateComparedToDelay
} from "../../helpers/helpers.functions";
import {Notification, NotificationEnum} from "../../models/Notification";
import {CategoryService} from "../../services/category.service";
import {Service, ServiceStructure} from "../../models/Service";
import {ScreenService} from "../../services/screen.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  hasLoadedServices: boolean | null = null;

  servicesList: ServiceStructure[] = [];

  constructor(
    private translationService: TranslationService,
    private notificationService: NotificationService,
    private router: Router,
    private categoryService: CategoryService,
    private screenService: ScreenService
  ) { }

  get notifications(){
    return this.notificationService.userEnquiriesNotifications;
  }

  get someCategories(){
    let result = []
    let usedIndexes = [];
    const maxCategoriesNumber = 3;
    for(let i = 0; i < maxCategoriesNumber; i++){
      if(this.servicesList.length > (i+1)){
        let index = getRandomInt(0, maxCategoriesNumber, usedIndexes);
        result.push(this.servicesList[index]);
        usedIndexes.push(index);
      }
      else{
        break;
      }
    }

    return result;
  }

  get trendingCategories(){
    let result = []
    let usedIndexes = [];
    const maxCategoriesNumber = 3;
    let temp = this.servicesList.filter(elt => true).sort((a, b) => b.parent?.total - a.parent?.total)
    for(let i = 0; i < maxCategoriesNumber; i++){
      result.push(temp[i]);
    }

    return result;
  }

  ngOnInit() {
    this.loadServices();
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en;
  }

  serviceTotalAbbreviation(total: number){
    return (total > 50 ? '+' : '')+getANumberAbbreviation(total);
  }

  categoryImageIllustration(illustration: string){
    return getARemoteResourcePath(illustration);
  }

  notificationImagePath(state){
    return getARequestStateNotificationImage(state);
  }

  notificationTitle(state: number){
    return this.translationService.getValueOf(getARequestStateNotificationTitle(state));
  }

  notificationDescription(state: number, requestCode: string){
    let result = '';
    getARequestStateNotificationDescription(state, requestCode, false)
      .forEach((elt, index) =>{
        if(index > 0){
          result += ' ';
        }
        result += elt.shouldNotTranslate ? elt.key : this.translationService.getValueOf(elt.key);
      });
    return result;
  }

  printDate(date: Date | string, withDelay: boolean = false)
  {
    date = typeof date === 'string' ? new Date(date) : date;
    return !withDelay ? printReadableDate(date, this.translationService.getCurrentLang(), true, true)
      : printReadableDateComparedToDelay(date, this.translationService.getCurrentLang());
  }

  onViewNotification(notification: Notification){
    this.notificationService.readANotification(notification.id);
    if(notification.reason === NotificationEnum.USER_ENQUIRY){
      this.router.navigate(['history/'+notification.data?.enquiry_code]);
    }
  }

  loadServices(){
    this.hasLoadedServices = null;
    this.categoryService.getAllServices()
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

  goToCategoriesList(){
    this.router.navigate(["categories"]);
  }

}
