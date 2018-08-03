import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
@Injectable()
export class PnrService {

  constructor(private _http: HttpClient) { }

  getPNRStatus(pnr) {
    const root_url = `http://localhost:8080/Demo/pnr?pnr=${pnr}`;
    console.log(root_url);
    return this._http.get(root_url)
      .map(result => result)
      .retry(3);
  }
}
