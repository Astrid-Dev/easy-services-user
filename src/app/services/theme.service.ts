import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import {Preferences} from "@capacitor/preferences";

const THEME_KEY = "THEME";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  currentTheme: string = "";

  private themesList = ['light', 'dark'];

  constructor() {
    this.detectColorScheme();
  }
  private detectColorScheme(){ //default to light
    Preferences.get({key: THEME_KEY})
      .then((theme) =>{
        if(theme.value && this.themesList.includes(theme.value))
        {
          this.currentTheme = theme.value;
          this.switchTheme(this.currentTheme);
        }
        else
        {
          if(!window.matchMedia) {
            this.switchTheme(this.themesList[1]);
            return false;
          } else if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
            this.currentTheme = 'dark';
            this.switchTheme(this.currentTheme);
          }
        }
      });
  }

  switchTheme(theme: string) {
    if(this.themesList.includes(theme))
    {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      Preferences.set({key: THEME_KEY, value: this.currentTheme});
    }
  }

  getCurrentTheme()
  {
    return this.currentTheme;
  }
}
