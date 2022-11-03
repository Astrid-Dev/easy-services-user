import { Injectable } from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {TranslationService} from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  constructor(
    private translationService: TranslationService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  async presentAlert(options: any) {
    const alert = await this.alertController.create({
      ...options
    });

    await alert.present();
  }

  async presentSuccessAlert(options: any)
  {
    const message = typeof options.message === 'undefined' ? 'Success message' : options.message;
    const alert = await this.alertController.create({
      ...options,
      header: this.translationService.getValueOf('SCREENALERT.SUCCESS'),
      message:
        '<div class=\'success-alert\'>' +
        '<div class=\'alert-icon\'>' +
        '<ion-icon name=\'checkmark-sharp\'></ion-icon>'+
        '</div>'+
        '<div>' +
        message+
        '</div>'+
        '</div>'
    });

    await alert.present();
  }

  async presentErrorAlert(options: any)
  {
    const message = typeof options.message === 'undefined' ? 'Error message' : options.message;
    const alert = await this.alertController.create({
      ...options,
      header: this.translationService.getValueOf('SCREENALERT.ERROR'),
      message:
        '<div class=\'error-alert\'>' +
        '<div class=\'alert-icon\'>' +
        '<ion-icon name=\'close-sharp\'></ion-icon>'+
        '</div>'+
        '<div>' +
        message+
        '</div>'+
        '</div>'
    });

    await alert.present();
  }

  async presentWarningAlert(options: any)
  {
    const message = typeof options.message === 'undefined' ? 'Error message' : options.message;
    const alert = await this.alertController.create({
      ...options,
      header: this.translationService.getValueOf('SCREENALERT.WARNING'),
      message:
        '<div class=\'warning-alert\'>' +
        '<div class=\'alert-icon\'>' +
        '<ion-icon name=\'warning-outline\'></ion-icon>'+
        '</div>'+
        '<div>' +
        message+
        '</div>'+
        '</div>'
    });

    await alert.present();
  }

  async dismissAlert()
  {
    await this.alertController.dismiss();
  }

  async createAModal(options: any){
    const modal = this.modalController.create({
      ...options
    })
  }
}
