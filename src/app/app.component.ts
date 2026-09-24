import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LinkItem, SnipService } from './snip.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-shell">
      <div class="glow"></div>
      <main class="content">
        <header class="hero">
          <p class="eyebrow">Snip</p>
          <h1>Shorten a link in seconds</h1>
          <p class="subtitle">Create memorable URLs for the links you share most.</p>
        </header>

        <form class="composer" (ngSubmit)="submitUrl()" novalidate>
          <input
            type="url"
            [ngModel]="inputUrl()"
            (ngModelChange)="inputUrl.set($event)"
            name="link"
            placeholder="https://example.com"
            aria-label="URL to shorten"
            [class.invalid]="urlError()"
          />
          <button type="submit" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Shortening...' : 'Shorten' }}
          </button>
        </form>

        @if (urlError()) {
          <div class="notice error">{{ urlError() }}</div>
        }

        @if (createdLink()) {
          <div class="notice success">
            <span>Short link:</span>
            <a [href]="createdLink()?.shortUrl" target="_blank" rel="noreferrer">{{ createdLink()?.shortUrl }}</a>
          </div>
        }

        @if (apiError()) {
          <div class="notice error">{{ apiError() }}</div>
        }

        <section class="panel">
          <h2>Recent links</h2>

          @if (links().length === 0) {
            <p class="empty">No links yet.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>URL</th>
                    <th>Hits</th>
                  </tr>
                </thead>
                <tbody>
                  @for (link of links(); track link.code) {
                    <tr>
                      <td>
                        <a [href]="link.shortUrl" target="_blank" rel="noreferrer">{{ link.code }}</a>
                      </td>
                      <td class="url-cell">
                        <a [href]="link.url" target="_blank" rel="noreferrer">{{ link.url }}</a>
                      </td>
                      <td>{{ link.hits }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private service = inject(SnipService);

  inputUrl = signal('');
  isSubmitting = signal(false);
  urlError = signal('');
  apiError = signal('');
  createdLink = signal<LinkItem | null>(null);
  links = signal<LinkItem[]>([]);

  constructor() {
    this.loadLinks();
  }

  submitUrl() {
    const raw = this.inputUrl().trim();

    if (!raw) {
      this.urlError.set('Please enter a URL.');
      this.apiError.set('');
      return;
    }

    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Only http and https URLs are allowed.');
      }
    } catch {
      this.urlError.set('Please enter a valid http or https URL.');
      this.apiError.set('');
      return;
    }

    this.urlError.set('');
    this.apiError.set('');
    this.isSubmitting.set(true);

    this.service.createLink(raw).subscribe({
      next: (link) => {
        this.createdLink.set(link);
        this.inputUrl.set('');
        this.loadLinks();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.apiError.set(err?.error?.error || 'Unable to shorten URL.');
        this.isSubmitting.set(false);
      }
    });
  }

  private loadLinks() {
    this.service.getLinks().subscribe({
      next: (items) => this.links.set(items),
      error: () => this.apiError.set('Could not load links from the backend.')
    });
  }
}
