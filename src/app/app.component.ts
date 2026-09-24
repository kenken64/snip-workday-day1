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
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #0c0b10;
        color: #f5f2ee;
        font-family: Inter, 'Segoe UI', sans-serif;
      }

      * { box-sizing: border-box; }

      .page-shell {
        position: relative;
        min-height: 100vh;
        background:
          radial-gradient(circle at top, rgba(255, 119, 92, 0.38), transparent 28%),
          #0c0b10;
      }

      .glow {
        position: fixed;
        inset: 0 0 auto 0;
        height: 36rem;
        background: linear-gradient(90deg, rgba(255,129,100,0.18), rgba(255,104,130,0.2), rgba(255,164,127,0.16));
        pointer-events: none;
      }

      .content {
        position: relative;
        max-width: 1100px;
        margin: 0 auto;
        padding: 5rem 1.5rem 4rem;
      }

      .hero {
        text-align: center;
        margin-bottom: 2rem;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.7rem;
        color: #ffb89e;
        margin-bottom: 0.75rem;
      }

      h1 {
        font-size: clamp(2.4rem, 5vw, 4.5rem);
        line-height: 1.05;
        margin: 0;
      }

      .subtitle {
        color: #d7d0cc;
        margin-top: 1rem;
        font-size: 1.05rem;
      }

      .composer {
        display: flex;
        gap: 0.75rem;
        margin: 2rem auto 1rem;
        max-width: 820px;
        background: rgba(24, 22, 28, 0.92);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 999px;
        padding: 0.65rem 0.7rem 0.65rem 1.2rem;
        box-shadow: 0 24px 60px rgba(0,0,0,0.35);
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        color: #f7f3f0;
        font-size: 1.05rem;
        outline: none;
      }

      input::placeholder { color: #a69990; }
      input.invalid { outline: 1px solid #ff8c7d; }

      button {
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #ff8e6e, #ff6f8f);
        color: white;
        padding: 0.9rem 1.4rem;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled { opacity: 0.7; cursor: wait; }

      .notice {
        max-width: 820px;
        margin: 0.75rem auto;
        padding: 0.9rem 1rem;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.06);
      }

      .notice.success {
        background: rgba(50, 141, 92, 0.14);
        color: #d9fee4;
      }

      .notice.error {
        background: rgba(196, 78, 63, 0.12);
        color: #ffd9d3;
      }

      .panel {
        max-width: 820px;
        margin: 2rem auto 0;
        background: rgba(18, 17, 21, 0.85);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 26px;
        padding: 1.2rem 1.1rem 0.5rem;
      }

      h2 {
        margin: 0 0 1rem;
        font-size: 1.2rem;
      }

      .empty {
        color: #d0c7c2;
        margin: 0 0 1rem;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        text-align: left;
        padding: 0.85rem 0.6rem;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        vertical-align: top;
      }

      th {
        color: #d9d2cf;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      a {
        color: #ffaf8d;
        text-decoration: none;
      }

      .url-cell {
        max-width: 360px;
        overflow-wrap: anywhere;
      }
    `
  ]
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
