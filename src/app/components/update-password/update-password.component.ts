import { Component, OnInit } from '@angular/core';
import {TranslationService} from "../../services/translation.service";
import {AuthStateService} from "../../services/auth-state.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ScreenService} from "../../services/screen.service";
import {confirmedValidator} from "../../helpers/password-confirmation.validator";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
})
export class UpdatePasswordComponent implements OnInit {

  formIsSubmitted = false;

  passwordForm !: FormGroup;
  isProcessing: boolean = false;

  constructor(
    private translationService: TranslationService,
    private authStateService: AuthStateService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private screenService: ScreenService
  ) {
    this.passwordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      new_password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirm_password: ['', [Validators.required]],
    },{
      validator: confirmedValidator('new_password', 'confirm_password'),
    });
  }

  get errorControl(){
    return this.passwordForm.controls;
  }

  ngOnInit() {}

  onFormSubmit(){
    this.formIsSubmitted = true;

    if(!this.passwordForm.valid)
    {
      this.screenService.presentErrorAlert({
        mode: "ios",
        message: this.translationService.getValueOf("REGISTER.INVALIDFORM"),
        buttons: ["OK"]
      });
    }
    else{
      this.isProcessing = true;
      // this.authService.updatePassword()
    }
  }

}
