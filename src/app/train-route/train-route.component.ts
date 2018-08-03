import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TrainRouteService } from '../train-route.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinct';


@Component({
  selector: 'app-train-route',
  templateUrl: './train-route.component.html',
  styleUrls: ['./train-route.component.scss']
})
export class TrainRouteComponent implements OnInit {
  autocomplete = false;
  snackValue;
  showSnack;
  showProgress = false;
  train: String;
  results;
  isForm = true;
  isNavActive = false;
  latestSerch = new Subject<String>(); trainNumber; data;
  constructor(public http: HttpClient,
    private _route: ActivatedRoute,
    private _routeService: TrainRouteService,
    private _afs: AngularFirestore) {

    this.trainNumber = this._route.snapshot.params['train'];
    if (this.trainNumber) { this.getData(); }

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

  validateAndGetData() {
    this.trainNumber = this.train.replace(/[^0-9]/g, '');
    if (this.trainNumber.toString().length === 5) {
      this.isForm ? this.getData() : this.isForm = true;
    }
  }
  getData() {
    this.showProgress = true;
    this._routeService.getTrainRoute(this.trainNumber)
      .subscribe(
        (data) => {
          this.showProgress = false;
          switch (data['response_code']) {
            case 200:
              this.data = data;
              this.isForm = false;
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
  newSearch(term) {
    this.autocomplete = true;
    this.latestSerch.next(`${term.charAt(0).toUpperCase()}${term.slice(1)}`);
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
