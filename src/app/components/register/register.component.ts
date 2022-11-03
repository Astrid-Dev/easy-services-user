import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {confirmedValidator, PasswordConfirmationValidator} from "../../helpers/password-confirmation.validator";
import {ScreenService} from "../../services/screen.service";
import {TranslationService} from "../../services/translation.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/User";
import {PhoneValidator} from "../../helpers/phone.validator";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  registerForm !: FormGroup;
  formIsSubmitted: boolean = false;
  isProcessing: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private screenService: ScreenService,
    private translationService: TranslationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      names: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      // phone_number: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(18)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirm_password: ['', [Validators.required]],
      country: ['CM']
    },
      {
        validator: confirmedValidator('password', 'confirm_password'),
      }
    );

    this.registerForm.addControl('phone_number', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(18),
        PhoneValidator.validCountryPhone(this.registerForm.controls.country)
      ])));
  }

  ngOnInit() {}

  onFormSubmit(){
    this.formIsSubmitted = true;

    if(!this.registerForm.valid)
    {
      this.screenService.presentErrorAlert({
        mode: "ios",
        message: this.translationService.getValueOf("REGISTER.INVALIDFORM"),
        buttons: ["OK"]
      });
    }
    else{
      this.isProcessing = true;
      const user:User = {
        username: this.formValue.username,
        names: this.formValue.names,
        email: this.formValue.email,
        phone_number: this.formValue.phone_number,
        password: this.formValue.password,
        password_confirmation: this.formValue.confirm_password,
      }
      this.authService.register(user)
        .then((res) =>{
          this.isProcessing = false;

          this.screenService.presentSuccessAlert({
            mode: "ios",
            message: this.translationService.getValueOf("REGISTER.SUCCESS"),
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.router.navigate(["login"], {state:{userIsNewer: true}});
                }
              }
            ]
          });
        })
        .catch((err) =>{
          this.isProcessing = false;
          console.error(err);

          let message = this.translationService.getValueOf("REGISTER.ERROR");
          if(err.status === 400)
          {
            message = this.translationService.getValueOf("REGISTER.VALIDATORERROR") + "<ul>";
            let error = JSON.parse(err.error);
            let errorsNumber = 0;
            if(error?.email) {
              errorsNumber++;
              message += "<li>" + this.translationService.getValueOf("REGISTER.EMAIL.USED") + "</li>";
            }
            if(error?.username) {
              errorsNumber++;
              message += "<li>" + this.translationService.getValueOf("REGISTER.USERNAME.USED") + "</li>";
            }
            if(error?.phone_number) {
              errorsNumber++;
              message += "<li>" + this.translationService.getValueOf("REGISTER.PHONENUMBER.USED") + "</li>";
            }

            if(errorsNumber > 0)
            {
              message += "</ul>"+this.translationService.getValueOf("REGISTER.CORRECTION");
            }
            else{
              message = this.translationService.getValueOf("REGISTER.ERROR");
            }
          }
          this.screenService.presentErrorAlert({
            mode: "ios",
            message: message,
            buttons: ["OK"]
          });
        })
    }

  }

  get errorControl(){
    return this.registerForm.controls;
  }

  get formValue(){
    return this.registerForm.value;
  }

  goToLogin(){
    this.router.navigate(["/login"]);
  }


}
