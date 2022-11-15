import { Component, OnInit } from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {AuthStateService} from "../../services/auth-state.service";
import {User} from "../../models/User";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ScreenService} from "../../services/screen.service";
import {AuthService} from "../../services/auth.service";
import {PhoneValidator} from "../../helpers/phone.validator";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {

  hasLoadedUserData: boolean | null = null;
  user: User | null;

  formIsSubmitted = false;
  isProcessing = false;

  userDataForm !: FormGroup;
  constructor(
    private translationService: TranslationService,
    private authStateService: AuthStateService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private screenService: ScreenService
  ) {
    this.userDataForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      names: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      // phone_number: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(18)]],
      country: ['CM']
    });
    this.userDataForm.addControl('phone_number', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(18),
        PhoneValidator.validCountryPhone(this.userDataForm.controls.country)
      ])));
  }

  get errorControl(){
    return this.userDataForm.controls;
  }

  get formValue(){
    return this.userDataForm.value;
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData()
  {
    this.hasLoadedUserData = null;

    this.authStateService.getUserData()
      .then((res) =>{
        this.user = res;
        console.log(this.user);
        this.userDataForm.controls.username.setValue(this.user.username);
        this.userDataForm.controls.names.setValue(this.user.names);
        this.userDataForm.controls.email.setValue(this.user.email);
        this.userDataForm.controls.phone_number.setValue(this.user.phone_number);
        this.hasLoadedUserData = true;
      })
      .catch((err) =>{
        console.error(err);
        this.hasLoadedUserData = false;
      });

  }

  onFormSubmit(){
    this.formIsSubmitted = true;

    if(!this.userDataForm.valid)
    {
      this.screenService.presentErrorAlert({
        mode: "ios",
        message: this.translationService.getValueOf("FORM.INVALIDFORM"),
        buttons: ["OK"]
      });
    }
    else{
      this.isProcessing = true;
      let data = new FormData();
      data.append("username", this.formValue.username);
      data.append("names", this.formValue.names);
      data.append("phone_number", this.formValue.phone_number);
      data.append("email", this.formValue.email);

      this.authService.updateUserProfile(this.user.id, data)
        .then((res) =>{
          console.log(res);
          this.isProcessing = false;
          this.screenService.presentToast({
            message: this.translationService.getValueOf("ACCOUNT.SUCCESSFULEDITION")
          });
        })
        .catch((err) =>{
          console.error(err);
          this.isProcessing = false;
          this.screenService.presentErrorAlert({
            mode: "ios",
            message: this.translationService.getValueOf("ACCOUNT.EDITIONERROR"),
            buttons: ["OK"]
          });
        });
    }
  }

}
