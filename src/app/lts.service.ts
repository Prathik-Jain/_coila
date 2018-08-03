import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LtsService {

  constructor(private _http: HttpClient) { }
  lts(train, date) {
    // tslint:disable-next-line:max-line-length
    const url = `http://localhost:8080/Demo/TrainStatus?train=${train}&date=${date}`;
    console.log(url);
    return this._http.get(url)
      .map(res => res);
  }
}
