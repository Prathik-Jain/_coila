import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { WindowService } from '../window.service';
import * as firebase from 'firebase';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-phone-auth',
  templateUrl: './phone-auth.component.html',
  styleUrls: ['./phone-auth.component.scss']
})

export class PhoneAuthComponent implements OnInit {
  @Input() pnr: String;
  @Input() lastStatus: String;

  constructor(private _win: WindowService, private _afs: AngularFirestore) { }
  windowRef;
  phoneNumber;
  verificationCodeSent = false;
  verificationCode;
  user;
  showSnack = false;
  snackValue;

  ngOnInit() { }

  sendAuthCode() {
    this.windowRef = this._win.windowRef;
    const appVerifier = this.windowRef.recaptchaVerifier;
    const num = '+91' + this.phoneNumber;
    this.verificationCodeSent = true;
    console.log(`${this.verificationCodeSent}`);
    firebase.auth().signInWithPhoneNumber(num, appVerifier)
      .then(result => {
        this.windowRef.confirmationResult = result;
      })
      .catch(error => console.log(error));
  }

  verifyAuthCode() {
    this.windowRef.confirmationResult
      .confirm(this.verificationCode)
      .then(result => {
        this.user = result.user;
        this.addData();
      })
      .catch(error => this.showSnackbar(`Invlaid verification code`));
  }

  addData() {
    this._afs.collection('pnr').doc(this.pnr.toString())
      .set({ 'Pnr Number': this.pnr, 'Last Status': this.lastStatus, 'Phone Number': this.phoneNumber }, { merge: true });
  }

  showSnackbar(value) {
    this.snackValue = value;
    this.showSnack = true;
    setInterval(() => {
      this.showSnack = false;
    }, 5500);
  }

}
