import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class BackendProxy {
  private http = inject(HttpClient);

  // For local testing
  // private BACKEND_URL = `http://localhost:10000`;
  private BACKEND_URL = `https://api.aidanhonan.com`;

  test(): Observable<string> {
    return this.http.post<string>(`${this.BACKEND_URL}/test`, {});
  }
}