import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DomainStore,
  DOMAIN_SUFFIX,
  isValidDomainInput,
  normalizeDomainInput,
  resolveFullDomain,
} from '@features/domain/model/domain.store';
import { ToastService } from '@shared/ui/toast/toast.service';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { I18nStore, isSupportedLocale } from '@shared/i18n/i18n.store';

@Component({
  selector: 'page-domen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="h-full grid place-items-center p-6 bg-gradient-to-b from-emerald-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center" aria-hidden="true">
              <shared-icon name="logo" [size]="24"></shared-icon>
            </div>
            <div>
              <div class="text-sm font-extrabold leading-tight tracking-tight">Brooklyn LMS</div>
              <div class="text-xs font-semibold text-slate-500">{{ i18n.t('app.tagline') }}</div>
            </div>
          </div>
          <select
            class="h-9 rounded-xl border border-slate-200 bg-white/80 px-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-600 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            [ngModel]="i18n.locale()"
            (ngModelChange)="setLocale($event)"
            [attr.aria-label]="i18n.t('label.language')"
          >
            @for (option of languageOptions; track option.id) {
              <option [value]="option.id">{{ option.label }}</option>
            }
          </select>
        </div>

        <h1 class="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">{{ i18n.t('heading.company_domain') }}</h1>
        <div class="mt-1 text-sm font-semibold text-slate-500">{{ i18n.t('message.domain_intro') }}</div>

        <div class="mt-5 grid gap-2">
          <label class="grid gap-1">
            <span class="text-xs font-extrabold text-slate-500">{{ i18n.t('label.domain') }}</span>
            <div class="flex items-center gap-2">
              <input
                class="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                type="text"
                [(ngModel)]="domainInput"
                placeholder="brooklynlms"
                autocomplete="organization"
                (keydown.enter)="continue()"
              />
              @if (showSuffix()) {
                <span class="text-sm font-bold text-slate-500">.{{ domainSuffix }}</span>
              }
            </div>
          </label>
          <div class="text-xs font-semibold text-slate-400">
            {{ i18n.t('message.search_domain_preview') }}
            <span class="text-slate-600">{{ previewDomain() || i18n.t('ui.preview_empty') }}</span>
          </div>
        </div>

        <div class="mt-5 grid gap-2">
          <button class="h-11 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800" type="button" (click)="continue()">
            {{ i18n.t('action.continue') }}
          </button>
          @if (domainStore.hasDomain()) {
            <button
              class="h-11 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold hover:bg-slate-50"
              type="button"
              (click)="useSaved()"
            >
              {{ i18n.t('action.use_saved_domain') }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class DomenPage implements OnInit {
  readonly domainStore = inject(DomainStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly i18n = inject(I18nStore);
  readonly languageOptions = this.i18n.languageOptions;

  readonly domainSuffix = DOMAIN_SUFFIX;
  domainInput = '';

  ngOnInit() {
    if (this.domainStore.domain()) {
      this.domainInput = this.domainStore.domain();
    }
  }

  previewDomain() {
    const normalized = normalizeDomainInput(this.domainInput);
    if (!isValidDomainInput(normalized)) return '';
    return resolveFullDomain(normalized);
  }

  async continue() {
    const normalized = normalizeDomainInput(this.domainInput);
    if (!isValidDomainInput(normalized)) {
      this.toast.show(this.i18n.t('toast.enter_valid_domain'));
      return;
    }
    if (!this.domainStore.setDomain(normalized)) {
      this.toast.show(this.i18n.t('toast.enter_valid_domain'));
      return;
    }
    void this.router.navigateByUrl('/login');
  }

  useSaved() {
    if (!this.domainStore.hasDomain()) {
      this.toast.show(this.i18n.t('toast.no_saved_domain'));
      return;
    }
    void this.router.navigateByUrl('/login');
  }

  showSuffix() {
    if (!this.domainSuffix) return false;
    const withoutProtocol = this.domainInput.trim().replace(/^https?:\/\//, '');
    return !/[.:]/.test(withoutProtocol);
  }

  setLocale(value: string) {
    if (!isSupportedLocale(value)) return;
    this.i18n.setLocale(value);
  }
}
