import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SeatAvailabilityService {

  constructor(private _http: HttpClient) { }
  getTrains(src, dest, date) {
    const url = `http://localhost:8080/Demo/TrainAvailability?src=${src}&dest=${dest}&date=${date}`;
    return this._http.get(url);
  }
  getAvailability(train, src, dest, date, pref_class, quota) {
    // tslint:disable-next-line:max-line-length
    const url = `http://localhost:8080/Demo/SeatAvailability?train=${train}&src=${src}&dest=${dest}&date=${date}&class=${pref_class}&quota=${quota}`;
    console.log(url);
    return this._http.get(url);
  }
}
