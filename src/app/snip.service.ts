import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LinkItem {
  code: string;
  url: string;
  shortUrl: string;
  hits: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SnipService {
  private readonly http = inject(HttpClient);

  createLink(url: string): Observable<LinkItem> {
    return this.http.post<LinkItem>('http://localhost:3000/api/links', { url });
  }

  getLinks(): Observable<LinkItem[]> {
    return this.http.get<LinkItem[]>('http://localhost:3000/api/links');
  }
}
