import { Component, OnInit } from '@angular/core';
import {Service, ServiceSelection} from "../../models/Service";
import {User} from "../../models/User";
import {AuthStateService} from "../../services/auth-state.service";
import {TranslationService} from "../../services/translation.service";
import {ServiceProviderService} from "../../services/service-provider.service";
import {ScreenService} from "../../services/screen.service";
import {Router} from "@angular/router";
import {CategoryService} from "../../services/category.service";

@Component({
  selector: 'app-service-provider-registration',
  templateUrl: './service-provider-registration.component.html',
  styleUrls: ['./service-provider-registration.component.scss'],
})
export class ServiceProviderRegistrationComponent implements OnInit {

  servicesList: ServiceSelection[] = [];
  user!: User;

  hasLoadedServices = null;
  hasLoadedUserData = null;
  isProcessing = false;

  constructor(
    private authStateService: AuthStateService,
    private categoryService: CategoryService,
    private translationService: TranslationService,
    private serviceProviderService: ServiceProviderService,
    private screenService: ScreenService,
    private router: Router
    ) { }


  get canSubmitData(){
    return this.servicesList.filter(elt => elt.parent.hasCheckedOneChild).length > 0;
  }

  ngOnInit() {
    this.loadAll();
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en;
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
                                  isChecked: false
                                }
                              })
            });
          });
        console.log(this.servicesList);
        this.hasLoadedServices = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedServices = false;
      });
  }

  onCheckAllChildOfAService(serviceId: number){
    this.servicesList.forEach((elt, index, array) =>{
      if(elt.parent.id === serviceId){
        array[index] = {
          parent: {...elt.parent, hasCheckedOneChild: true},
          children : elt.children.map((child) => {return {...child, isChecked: true}})
        }
      }
    });
  }

  onChildServiceChange(parentId: number, serviceId: number)
  {
    this.servicesList.forEach((elt, index, array) =>{
      if(elt.parent.id === parentId){
        let temp = elt.children.filter((child) => {
          return child.id === serviceId ? !child.isChecked : child.isChecked;
        });
        array[index] = {
          ...elt,
          parent: {
            ...elt.parent,
            hasCheckedOneChild: temp.length > 0,
            hasCheckedAllChildren: temp.length === elt.children.length,
          }
        }
      }
      // if(elt.parent.id === parentId){
      //   elt.children.forEach((child, childIndex, childrenArray) =>{
      //     if(child.id === childId){
      //       childrenArray[childIndex] = {
      //         ...child,
      //         isChecked: !child.isChecked
      //       }
      //     }
      //   })
      // }
    });
  }

  onSubmit(){
    this.isProcessing = true;

    let services = [];
    this.servicesList.filter((elt) => elt.parent.hasCheckedOneChild)
      .forEach((elt) =>{
        services = services.concat(elt.children.filter(child => child.isChecked).map(elt => elt.id));
      });
    this.serviceProviderService.registerAServiceProvider(this.user.id, services)
      .then((res: any) =>{
        this.user = {
          ...this.user,
          is_provider: true,
          provider: {
            ...res.provider,
            applications: res.applications
          }
        }
        this.authStateService.setUserData(this.user);
        this.isProcessing = false;
        this.screenService.presentToast({
          message: this.translationService.getValueOf('SERVICEPROVIDERPROFILE.SERVICEPROVIDERREGISTRATIONSUCCESS'),
        });
        this.router.navigate(["dashboard"]);
      })
      .catch((err) =>{
        console.error(err);
        this.isProcessing = false;
        this.screenService.presentErrorAlert({
          mode: 'ios',
          message: this.translationService.getValueOf('SERVICEPROVIDERPROFILE.SERVICEPROVIDERREGISTRATIONERROR'),
          buttons: ['OK']
        });
      });

  }

}
