// TODO:: Work for Recaptcha call back
import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { environment } from '../environments/environment';
import { WindowService } from './window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  windowRef: any;
  offline = '';

  constructor(private _win: WindowService) { }
  ngOnInit() {
    if (!navigator.onLine) {
      this.offline = 'Seems like you\'re offline we\'ll wait for you to come back online';
    } else {
      this.offline = '';
      firebase.initializeApp(environment.firebaseConfig);
      this.windowRef = this._win.windowRef;
      this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'badge': 'bottomleft',
        'theme': 'light'
      });
      this.windowRef.recaptchaVerifier.render();
    }
  }
}
