import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GravesService {
  //private gravesUrl = 'https://wipperfuerth.pgconnect.de/api/v1/webgis/grab'
  private gravePlotsUrl = 'https://wipperfuerth.pgconnect.de/api/v1/webgis/grabstelle'

  constructor(private http: HttpClient) { }

  getGravesData(): Observable<any> {
    return this.http.get<any>(this.gravePlotsUrl);
  }
}