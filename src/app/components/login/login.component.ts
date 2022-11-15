import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ScreenService} from "../../services/screen.service";
import {TranslationService} from "../../services/translation.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/User";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm !: FormGroup;
  formIsSubmitted: boolean = false;
  isProcessing: boolean = false;
  passwordFieldType: string = "password";

  userIsNewer: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private screenService: ScreenService,
    private translationService: TranslationService,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
      });
  }

  ngOnInit() {}

  onFormSubmit(){
    this.formIsSubmitted = true;

    if(!this.loginForm.valid)
    {
      this.screenService.presentErrorAlert({
        mode: "ios",
        message: this.translationService.getValueOf("LOGIN.INVALIDFORM"),
        buttons: ["OK"]
      });
    }
    else{
      this.isProcessing = true;
      let user:User = {
        email: this.formValue.email,
        password: this.formValue.password
      }
      this.authService.login(user)
        .then((res: any) =>{
          this.isProcessing = false;
          this.loginForm.reset();
          this.formIsSubmitted = false;
          this.notificationService.loadNotifications();
          this.screenService.presentToast({
            message: (this.translationService.getValueOf(this.userIsNewer ? "LOGIN.WELCOME" : "LOGIN.SEEAGAIN") + ", " + res.user.username) + " ! "+ this.translationService.getValueOf("LOGIN.SUCCESS"),
          });
          this.router.navigate(["home"]);
        })
        .catch((err) =>{
          this.isProcessing = false;
          console.error(err);

          let message = this.translationService.getValueOf("LOGIN.ERROR");
          if(err.status === 401) {
            message = this.translationService.getValueOf("LOGIN.VALIDATORERROR");
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
    return this.loginForm.controls;
  }

  get formValue(){
    return this.loginForm.value;
  }

  goToRegister(){
    this.router.navigate(["/register"]);
  }

  changePasswordType()
  {
    if(this.passwordFieldType === "password")
    {
      this.passwordFieldType = "text";
    }
    else{
      this.passwordFieldType = "password";
    }
  }

}
