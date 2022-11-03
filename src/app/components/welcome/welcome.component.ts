import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

  goToLogin(){
    this.router.navigate(["login"]);
  }

  goToRegister(){
    this.router.navigate(["register"]);
  }

}
