import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {NewEnquiryComponent} from './components/new-enquiry/new-enquiry.component';
import {CanLogOutGuard} from './helpers/can-log-out.guard';
import {CanLogInGuard} from './helpers/can-log-in.guard';
import { ServiceProviderRegistrationComponent } from './components/service-provider-registration/service-provider-registration.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [CanLogOutGuard],
    loadChildren: () => import('./main-tabs-bar/main-tabs-bar.module').then( m => m.MainTabsBarPageModule)
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [CanLogInGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [CanLogInGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [CanLogInGuard]
  },
  {
    path: 'new',
    component: NewEnquiryComponent,
    canActivate: [CanLogOutGuard]
  },
  {
    path: 'service-provider-registration',
    component: ServiceProviderRegistrationComponent,
    canActivate: [CanLogOutGuard]
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'main-tabs-bar',
    loadChildren: () => import('./main-tabs-bar/main-tabs-bar.module').then( m => m.MainTabsBarPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'enquiries',
    loadChildren: () => import('./pages/enquiries/enquiries.module').then( m => m.EnquiriesPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
