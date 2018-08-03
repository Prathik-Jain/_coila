import { Component, OnInit } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { LtsService } from '../lts.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinct';
import * as _moment from 'moment';
import { map } from 'rxjs/operators';



import { combineLatest } from 'rxjs/observable/combineLatest';
export const MY_FORMATS = {
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
  }
};

interface Station {
  code: String;
  name: String;
  lat: String;
  lng: String;
}

@Component({
  selector: 'app-live-train-status',
  templateUrl: './live-train-status.component.html',
  styleUrls: ['./live-train-status.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class LiveTrainStatusComponent implements OnInit {
  showSnack = false;
  snackValue;
  autocomplete = false;
  showProgress = false;
  showMap = false;
  infoWindowOpen = false;
  isNavActive: Boolean;
  isForm = true;
  train: String;
  lat: number;
  lng: number;
  status;
  results;
  polyline = [];

  latestSerch = new Subject<String>();
  StationCol: AngularFirestoreCollection<Station>;
  station: Observable<Station[]>;
  lastStation;

  minDate = _moment().subtract(4, 'days');
  maxDate = _moment();
  date = new FormControl(_moment());

  constructor(private _ltsService: LtsService,
    public http: HttpClient,
    private _route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private _afs: AngularFirestore) {
    this.train = this._route.snapshot.params['train'];
    const urlDate = this._route.snapshot.params['date'];
    if (this.train && urlDate) { this.getStatus(urlDate); }
    this.results = this.latestSerch
      .debounceTime(200)
      .distinct()
      .filter(term => !!term)
      .switchMap(term => {
        const endTerm = term + '\uf8ff';
        console.log(term);
        const trainColNumber = this._afs.collection('train', ref =>
          ref
            .orderBy('number')
            .limit(2)
            .startAt(term)
            .endAt(endTerm)
        ).valueChanges();
        const trainColName = this._afs.collection('train', ref =>
          ref
            .limit(5)
            .where('name', '>=', term)
        ).valueChanges();
        const combinedList = combineLatest<any[]>(trainColNumber, trainColName).pipe(
          map(arr => arr.reduce((acc, cur) => acc.concat(cur))),
        );
        return combinedList;
      })
      .map(res => res.map(train => `${train['name']} [ ${train['number']} ]`));
  }



  ngOnInit() { }

  newSearch(term) {
    this.autocomplete = true;
    this.latestSerch.next(`${term.charAt(0).toUpperCase()}${term.slice(1)}`);
  }

  validateAndGetData() {
    this.isForm ? this.getStatus() : this.isForm = true;
  }

  getStatus(date?) {
    this.showProgress = true;
    this.polyline = [];
    this._ltsService.lts(this.train.replace(/[^0-9]/g, ''), date ? date : this.date.value.format('DD-MM-YYYY'))
      .subscribe(
        (res) => {
          switch (res['response_code']) {
            case 200:
              this.status = res;
              for (const route of res['route']) {
                this.StationCol = this._afs.collection('station', ref => ref.where('code', '==', route['station']['code']));
                this.station = this.StationCol.valueChanges();
                this.station.forEach(element => {
                  element.forEach(station => {
                    console.log(JSON.stringify(station, null, 4));
                    this.polyline.push(station);
                    if (route['has_arrived']) {
                      this.lastStation = station;
                      console.log(JSON.stringify(this.lastStation));
                    }
                  });
                });
              }
              this.getCurrentStationLatLng(res['current_station']['code']);
              break;
            case 210:
              this.showSnackbar('Train does not run on the queried date');
              break;
            default:
              this.showSnackbar(` ${res['response_code']} Something wen't wrong :(  `);
          }
        },
        (err) => {
          console.error(err);
          this.showSnackbar('Something wen\'t wrong :(');
        });
  }

  getCurrentStationLatLng(code) {
    this.StationCol = this._afs.collection('station', ref => ref.where('code', '==', code));
    this.station = this.StationCol.valueChanges();
    this.station.forEach(stat => {
      if (stat[0] != null) {
        console.log('not empty ' + stat[0]);
        stat.forEach(sta => {
          this.lat = parseFloat(sta.lat.toString());
          this.lng = parseFloat(sta.lng.toString());
        });
      } else {
        console.log('empty ');
        console.log(this.lastStation);
        this.lat = this.lastStation.lat;
        this.lng = this.lastStation.lng;
      }
      this.showProgress = this.isForm = false;
      this.showMap = true;
      this.infoWindowOpen = true;
    });
  }

  getHrs(time) {
    const hrs = Math.floor((time / 60));
    const mins = time % 60;
    return `${hrs} Hour(s) ${mins} min(s)`;
  }
  getMins(time) {
    if (time === 0) {
      return `No delay`;
    }
    return `${time}min(s)`;
  }
  editStatus(status: string) {
    const time = parseInt(status.replace(/[^0-9]/g, ''), 10);
    if (time) {
      let newTime;
      time > 60 ? newTime = this.getHrs(time) : newTime = this.getMins(time);
      return status.substring(0, status.indexOf(time.toString())) + newTime;
    } else { return status; }
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
