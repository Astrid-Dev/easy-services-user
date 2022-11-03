import {Component, OnInit} from '@angular/core';
import {Service, ServiceSelection} from "../../models/Service";
import {User} from "../../models/User";
import {AuthStateService} from "../../services/auth-state.service";
import {EnquiryService} from "../../services/enquiry.service";
import {TranslationService} from "../../services/translation.service";
import {ServiceProviderService} from "../../services/service-provider.service";
import {ScreenService} from "../../services/screen.service";
import {Router} from "@angular/router";
import {arrayAreEquals} from "../../helpers/helpers.functions";

@Component({
  selector: 'app-service-provider-profile',
  templateUrl: './service-provider-profile.component.html',
  styleUrls: ['./service-provider-profile.component.scss'],
})
export class ServiceProviderProfileComponent implements OnInit {

  servicesList: ServiceSelection[] = [];
  user!: User;

  hasLoadedServices = null;
  hasLoadedUserData = null;
  isProcessing = false;

  constructor(
    private authStateService: AuthStateService,
    private enquiryService: EnquiryService,
    private translationService: TranslationService,
    private serviceProviderService: ServiceProviderService,
    private screenService: ScreenService,
    private router: Router
  ) { }

  get canSubmitData(){
    return (!arrayAreEquals(this.providerApplications, this.selectedServices)) && (this.servicesList.filter(elt => elt.parent.hasCheckedOneChild).length > 0);
  }

  get providerApplications(){
    return this.user?.provider?.applications ?
        this.user.provider.applications.map(elt => elt.service_id).sort((a, b) => a-b) :
        [];
  }

  get selectedServices(){
    let services = [];
    this.servicesList.filter((elt) => elt.parent.hasCheckedOneChild)
      .forEach((elt) =>{
        services = services.concat(elt.children.filter(child => child.isChecked).map(elt => elt.id));
      });

    return services.sort((a, b) => a-b);
  }

  ngOnInit() {
    this.loadUserData();
  }

  label(item: any){
    return this.translationService.getCurrentLang() === 'fr' ? item.label : item.label_en;
  }

  loadAll(){
    if(!this.hasLoadedUserData){
      this.loadUserData();
    }
    else if(!this.hasLoadedServices){
      this.loadServices();
    }
  }

  loadUserData(){
    this.hasLoadedUserData = null;
    this.authStateService.getUserData()
      .then((userData) =>{
        this.user = userData ?? null;
        console.log(this.user)
        this.hasLoadedUserData = !!this.user;
        this.loadServices();
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
              parent: {...elt, hasCheckedAllChildren: false, hasCheckedOneChild: false},
              children: res.filter((child: Service) => child.parent_id === elt.id)
                .map((child: Service) => {
                  return {
                    ...child,
                    isChecked: this.user?.provider?.applications?.some(application => application.service_id === child.id)
                  }
                })
            });
          });
        this.servicesList.forEach((elt, index, array) =>{
          let checkedChildren = elt.children.filter(child => child.isChecked);
          array[index] = {
            ...elt,
            parent: {
              ...elt.parent,
              hasCheckedOneChild: checkedChildren.length > 0,
              hasCheckedAllChildren: checkedChildren.length === elt.children.length,
            },
          }
        });
        console.log(this.servicesList);
        console.log(this.selectedServices);
        console.log(this.providerApplications)
        this.hasLoadedServices = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedServices = false;
      });
  }

  onServiceChange(isForAll: boolean, parentId: number, serviceId: number | null = null)
  {
    if(isForAll){
      this.servicesList.forEach((elt, index, array) =>{
        if(elt.parent.id === parentId){
          array[index] = {
            parent: {
              ...elt.parent,
              hasCheckedOneChild: true,
              hasCheckedAllChildren: true,
            },
            children: elt.children.map(child => {return {...child, isChecked: true}})
          }
        }
      });
    }
    else{
      this.servicesList.forEach((elt, index, array) =>{
        if(elt.parent.id === parentId) {
          let newChildren = elt.children.map(child => {
            return {...child, isChecked: (child.id === serviceId ? !child.isChecked : child.isChecked)}
          });

          let newCheckedChildren = newChildren.filter(child => child.isChecked);
          array[index] = {
            parent: {
              ...elt.parent,
              hasCheckedOneChild: newCheckedChildren.length > 0,
              hasCheckedAllChildren: newCheckedChildren.length === elt.children.length,
            },
            children: newChildren
          }
        }
      });
    }
  }

  onSubmit(){
    this.isProcessing = true;

    let services = this.selectedServices;
    this.serviceProviderService.registerAServiceProviderApplications(this.user?.provider?.id, services)
      .then((res: any) =>{
        this.user = {
          ...this.user,
          is_provider: true,
          provider: {
            ...this.user.provider,
            applications: res.applications
          }
        }
        this.authStateService.setUserData(this.user);
        this.isProcessing = false;
        this.screenService.presentSuccessAlert({
          mode: 'ios',
          message: this.translationService.getValueOf('SERVICEPROVIDERPROFILE.SUCCESSFULEDITION'),
          buttons: [{
            text: 'OK',
            handler: () =>{
              this.router.navigate(["dashboard"])
            }
          }]
        });
      })
      .catch((err) =>{
        console.error(err);
        this.isProcessing = false;
        this.screenService.presentErrorAlert({
          mode: 'ios',
          message: this.translationService.getValueOf('SERVICEPROVIDERPROFILE.EDITIONERROR'),
          buttons: ['OK']
        });
      });

  }

}
