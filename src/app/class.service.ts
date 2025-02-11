import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private baseUrl = 'http://localhost:8080/api/classes'; // URL de ton backend

  constructor(private http: HttpClient) {}

  createClass(classData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, classData);
  }
}
