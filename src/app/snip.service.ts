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
  private readonly linksUrl = '/api/links';

  createLink(url: string): Observable<LinkItem> {
    return this.http.post<LinkItem>(this.linksUrl, { url });
  }

  getLinks(): Observable<LinkItem[]> {
    return this.http.get<LinkItem[]>(this.linksUrl);
  }
}
