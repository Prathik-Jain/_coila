import { Component, OnInit } from '@angular/core';
import { PnrService } from '../pnr.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pnr',
  templateUrl: './pnr.component.html',
  styleUrls: ['./pnr.component.scss']
})
export class PnrComponent implements OnInit {
  snackValue;
  showSnack;
  showProgress = false;
  isForm = true;
  isBottom = false;
  isNavActive = false;
  data;
  pnr: String;
  abbreviations = [
    { code: 'CNF | Confirmed', value: 'Cancelled or Modified Passenger' },
    { code: 'RAC', value: 'Reservation Against Cancellation' },
    { code: 'WL', value: 'Waiting List' },
    { code: 'GNWL', value: 'General Waiting List' },
    { code: 'PQWL', value: 'Pooled Quota Waiting List' },
    { code: 'RLWL', value: 'Remote Location Waiting List' },
    { code: 'RQWL', value: 'Request Waiting List' },
    { code: 'CKWL', value: 'Tatkal Waiting List' },
    { code: 'REGRET/WL', value: 'Not allowed to book Waiting List ticket' }
  ];


  constructor(private _pnrService: PnrService, private _route: ActivatedRoute) {
    this.pnr = _route.snapshot.params['pnr'];
    if (this.pnr) { this.getData(); }
  }
  ngOnInit() { }

  validateAndGetData() {
    this.isForm ? this.getData() : this.isForm = true;
  }
  getData() {
    this.showProgress = true;
    this._pnrService.getPNRStatus(this.pnr)
      .subscribe(
        (data) => {
          switch (data['response_code']) {
            case 200:
              this.data = data;
              this.isForm = this.showProgress = false;
              break;
            case 220:
              this.showSnackbar('PNR FLUSHED');
              break;
            case 221:
              this.showSnackbar('Invalid PNR Number!');
              break;
            default:
              this.showSnackbar(` ${data['response_code']} Something wen't wrong :(  `);
          }
          console.log(JSON.stringify(data, null, 4));
        },
        (err) => {
          console.error(err);
          this.showSnackbar('Something wen\'t wrong :(');
        });
  }

  showSnackbar(value) {
    this.showProgress = false;
    this.snackValue = value;
    this.showSnack = true;
    setInterval(() => {
      this.showSnack = false;
    }, 5500);
  }
}


// 4042477869 Invalid
// 4240763769 Flushed
// 6512645251 Valid
