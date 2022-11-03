import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import {User} from "../../models/User";
import {AuthStateService} from "../../services/auth-state.service";
import {TranslationService} from "../../services/translation.service";
import {PopoverController} from "@ionic/angular";
import {LanguageSelectionPopoverComponent} from "../../components/language-selection-popover/language-selection-popover.component";
import {AuthService} from "../../services/auth.service";
import {ScreenService} from "../../services/screen.service";
import {ThemeService} from "../../services/theme.service";

const FRENCH_FLAG = 'assets/images/french.svg';
const ENGLISH_FLAG = 'assets/images/english.svg';

interface SettingItem{
  label: string;
  link: string;
  icon: string;
  guard?: string;
  hasRequestNotifications?: boolean;
  isLanguage?: boolean;
  isLogOut?: boolean;
  isTheme?: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  user!: User;
  hasLoadedUserData: boolean | null = null;
  isLoginOut: boolean = false;

  languages = [
    {
      code: 'en',
      flag: ENGLISH_FLAG,
      label: 'English'
    },
    {
      code: 'fr',
      flag: FRENCH_FLAG,
      label: 'Français'
    }
  ];

  themes = [
    {
      value: 'light',
      label: 'SETTINGS.LIGHT'
    },
    {
      value: 'dark',
      label: 'SETTINGS.DARK'
    }
  ]

  settingItems: SettingItem[] = [
    {
      link: 'settings/account',
      label: 'SETTINGS.ACCOUNT',
      icon: 'person-outline'
    },
    {
      link: 'settings/update-password',
      label: 'SETTINGS.UPDATEPASSWORD',
      icon: 'key-outline'
    },
    {
      link: 'dashboard',
      label: 'SETTINGS.DASHBOARD',
      icon: 'bar-chart-outline',
      guard: 'provider',
      hasRequestNotifications: true
    },
    {
      link: 'service-provider-registration',
      label: 'SETTINGS.BECOMEPROVIDER',
      icon: 'wallet-outline',
      guard: 'user'
    },
    {
      link: '',
      label: 'SETTINGS.LANGUAGE',
      icon: 'language-outline',
      isLanguage: true
    },
    {
      link: '',
      label: 'SETTINGS.THEME',
      icon: 'contrast-outline',
      isTheme: true
    },
    {
      link: '',
      label: 'SETTINGS.HELP',
      icon: 'help-circle-outline'
    },
    {
      link: '',
      label: 'SETTINGS.SECURITY',
      icon: 'shield-checkmark-outline'
    },
    {
      link: '',
      label: 'SETTINGS.LOGOUT',
      icon: 'log-out-outline',
      isLogOut: true
    },

  ]

  constructor(
    private router: Router,
    private authStateService: AuthStateService,
    private notificationService: NotificationService,
    private translationService: TranslationService,
    public popoverController: PopoverController,
    private authService: AuthService,
    private screenService: ScreenService,
    private themeService: ThemeService
  ) {}

  get currentFlag(){
    return this.translationService.getCurrentLang() === 'fr' ? FRENCH_FLAG : ENGLISH_FLAG;
  }

  get currentTheme(){
    return this.themeService.getCurrentTheme();
  }

  get currentLang(){
    return this.translationService.getCurrentLang();
  }

  get unreadRequestsNotifications(){
    return this.notificationService.unreadRequestsNotifications;
  }

  ngOnInit() {
    this.loadUserData();
  }

  settingId(setting: SettingItem, index: number){
    return setting.isLanguage ? 'popover-language-button' : setting.isTheme ? 'popover-theme-button' : ('setting'+index);
  }

  loadUserData(){
    this.hasLoadedUserData = null;
    this.authStateService.getUserData()
      .then((userData) =>{
        this.user = userData ?? null;
        if(userData && !userData.is_provider)
        {
          this.settingItems = this.settingItems.filter(elt => (!elt.guard || elt.guard === 'user'));
        }
        else if(userData && userData.is_provider && userData.provider?.applications?.length > 0)
        {
          this.settingItems = this.settingItems.filter(elt => (!elt.guard || elt.guard === 'provider'));
        }
        else{
          this.settingItems = this.settingItems.filter(elt => (!elt.guard));
        }
        this.hasLoadedUserData = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedUserData = false;
      });
  }

  onSettingClick(setting: SettingItem){
    if(!setting.isLanguage && !setting.isLogOut && !setting.isTheme){
      this.goTo(setting.link);
    }
    else if(setting.isLogOut){
      this.logOut();
    }
  }

  goTo(path: string){
    this.router.navigate([path]);
  }

  changeLanguage(lang: string){
    this.translationService.changeLanguage(lang);
  }

  changeTheme(theme: string){
    this.themeService.switchTheme(theme);
  }

  logOut(){
    this.screenService.presentAlert({
      mode: "ios",
      message: this.translationService.getValueOf('SETTINGS.LOGOUTQUESTION'),
      buttons: [
        {
          text: this.translationService.getValueOf('SUBMIT.NO'),
          role: 'cancel'
        },
        {
          text: this.translationService.getValueOf('SUBMIT.YES'),
          handler: () =>{
            this.isLoginOut = true;
            this.authService.logout()
              .then((res) =>{
                this.isLoginOut = false;
                this.router.navigate(['welcome']);
              })
              .catch((err) =>{
                console.error(err);
                this.isLoginOut = false;
                this.screenService.presentErrorAlert({
                  mode: 'ios',
                  message: this.translationService.getValueOf('SETTINGS.LOGOUTFAILED'),
                  buttons: ['OK']
                });
              });
          }
        }
      ]
    });
  }

  // async presentPopover(e: Event) {
  //   const popover = await this.popoverController.create({
  //     component: LanguageSelectionPopoverComponent,
  //     event: e,
  //   });
  //
  //   await popover.present();''
  //
  //   const { role } = await popover.onDidDismiss();
  //   console.log(role);
  // }

}
