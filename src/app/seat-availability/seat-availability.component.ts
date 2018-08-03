import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinct';
import { SeatAvailabilityService } from '../seat-availability.service';
import * as _moment from 'moment';
export const MY_FORMATS = {
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
  }
};

@Component({
  selector: 'app-seat-availability',
  templateUrl: './seat-availability.component.html',
  styleUrls: ['./seat-availability.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class SeatAvailabilityComponent implements OnInit {
  results;
  snackValue;
  showSnack;
  showProgress = false;
  showBottomPanel = false;
  source: String;
  destination: String;
  pref_class: String = 'SL';
  pref_quota: String = 'GN';
  data;
  availability;
  showPanel = false;
  departure;
  arrival;
  travelTime;
  isDestinationFocused: Boolean;
  isSourceFocused: Boolean;
  latestSerch = new Subject<String>();
  isForm = true;
  isAutoCompleteOpen = false;
  isNavActive = false;
  minDate = _moment();
  maxDate = _moment().add(120, 'days');
  date = new FormControl(_moment());
  classes = [
    { value: 'SL', viewValue: 'Sleeper Class' },
    { value: '1A', viewValue: 'AC First Class' },
    { value: '2A', viewValue: 'AC 2 Tier' },
    { value: '3A', viewValue: 'AC 3 Tier' },
    { value: 'FC', viewValue: 'First Class' },
    { value: 'CC', viewValue: 'AC Chair Car' },
    { value: '2S', viewValue: 'Second Seating' }
  ];

  quotas = [
    { value: 'GN', viewValue: 'General Quota' },
    { value: 'TQ', viewValue: 'Tatkal Quota' },
    { value: 'LD', viewValue: 'Ladies Quota' }
  ];

  constructor(public http: HttpClient,
    private _route: ActivatedRoute,
    private _seatService: SeatAvailabilityService,
    private _afs: AngularFirestore) {

    const src = this.source = this._route.snapshot.params['src'];
    const dest = this.destination = this._route.snapshot.params['dest'];
    const urlDate = this._route.snapshot.params['date'];
    this.pref_class = this._route.snapshot.params['pref_class'] ? this._route.snapshot.params['pref_class'] : 'SL';
    this.pref_class = this._route.snapshot.params['pref_quota'] ? this._route.snapshot.params['pref_quota'] : 'GN';
    if (this.source && this.destination && urlDate) {
      this.getData(src, dest, urlDate);
    }
    this.results = this.latestSerch
      .debounceTime(200)
      .distinct()
      .filter(term => !!term)
      .switchMap(term => {
        const endTerm = term + '\uf8ff';
        let stationColCode;
        if (term.length <= 3) {
          stationColCode = this._afs.collection('station', ref =>
            ref
              .orderBy('code')
              .limit(2)
              .where('code', '>=', term.toUpperCase())
          ).valueChanges();
        }
        const stationColName = this._afs.collection('station', ref =>
          ref
            .limit(3)
            .where('name', '>=', term.toUpperCase())
        ).valueChanges();
        if (stationColCode) {
          const combinedList = combineLatest<any[]>(stationColCode, stationColName)
            .pipe(map(arr => arr.reduce((acc, cur) => acc.concat(cur))));
          return combinedList;
        } else { return stationColName; }
      })
      .map(res => res.map(station => `${station.name} [ ${station.code} ]`));
  }

  ngOnInit() { }


  newSearch(term, item) {
    this.latestSerch.next(`${term.charAt(0).toUpperCase()}${term.slice(1)}`);
    if (item === 'dest') {
      this.isDestinationFocused = true;
      this.isSourceFocused = false;
    } else {
      this.isDestinationFocused = false;
      this.isSourceFocused = true;
    }
    this.isAutoCompleteOpen = true;

  }
  completeStation(station) {
    this.isDestinationFocused ? this.destination = station : this.source = station;
    this.isAutoCompleteOpen = false;
  }


  validateAndGetData() {
    this.isForm ? this.getData() : this.isForm = true;
  }

  getData(src?, dest?, date?) {
    this.showProgress = true;
    // tslint:disable-next-line:max-line-length
    this._seatService.getTrains(src ? src : this.source.match(/\[(.*?)\]/)[1].trim(), dest ? dest : this.destination.match(/\[(.*?)\]/)[1].trim(), date ? date : this.date.value.format('DD-MM-YYYY'))
      .subscribe(
        (data) => {
          switch (data['response_code']) {
            case 200:
              this.data = data;
              this.isForm = false;
              this.showProgress = false;
              break;
            case 210:
              this.showSnackbar('Train does not run on the queried date');
              break;
            case 211:
              this.showSnackbar('Please selecet a different journey class');
              break;
            case 230:
              this.showSnackbar('Invalid date');
              break;
            case 405:
              this.showSnackbar('405 Something wen\'t wrong');
              break;
            default:
              this.showSnackbar(` ${data['response_code']} Something wen't wrong :(  `);
          }
        },
        (err) => {
          console.error(err);
          this.showSnackbar('Something wen\'t wrong :(');
        });
  }

  getSeatAvl(train, source, dest, departure, arrival, travelTime) {
    this.showPanel = false;
    setTimeout(() => { this.showBottomPanel = false; }, 500);
    this.showProgress = true;
    this._seatService.getAvailability(train, source, dest, this.date.value.format('DD-MM-YYYY'), this.pref_class, this.pref_quota)
      .subscribe(
        (res) => {
          switch (res['response_code']) {
            case 200:
              this.availability = res;
              this.departure = departure;
              this.arrival = arrival;
              this.travelTime = travelTime;
              this.showProgress = false;
              this.showBottomPanel = true;
              setTimeout(() => {
                this.showPanel = true;
              }, 500);
              break;
            case 210:
              this.showSnackbar('Train does not run on the queried date');
              break;
            case 211:
              this.showSnackbar('Please selecet a different journey class');
              break;
            case 230:
              this.showSnackbar('Train does not run on the given date');
              break;
            case 405:
              this.showSnackbar('405 Something wen\'t wrong');
              break;
            default:
              this.showSnackbar(res['response_code'] + 'Could not fetch data');
          }
        },
        (err) => {
          this.showSnackbar('Something went wrong :( ');
          console.log(err);
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
