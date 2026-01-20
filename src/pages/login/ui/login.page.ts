import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '@features/auth/model/auth.store';
import { DomainStore } from '@features/domain/model/domain.store';
import { UserStore } from '@entities/user/model/user.store';
import { ToastService } from '@shared/ui/toast/toast.service';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { I18nStore, isSupportedLocale } from '@shared/i18n/i18n.store';

@Component({
  selector: 'page-login',
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

        <h1 class="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">{{ i18n.t('action.sign_in') }}</h1>
        <div class="mt-1 text-sm font-semibold text-slate-500">{{ i18n.t('message.login_intro') }}</div>

        <div class="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <div class="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
              {{ i18n.t('label.company_domain') }}
            </div>
            <div class="text-sm font-bold text-slate-900">{{ domainStore.fullDomain() || i18n.t('ui.not_set') }}</div>
          </div>
          <button class="text-xs font-extrabold text-sky-600 hover:underline" type="button" (click)="changeDomain()">
            {{ i18n.t('action.change') }}
          </button>
        </div>

        <div class="mt-5 grid gap-3">
          <label class="grid gap-1">
            <span class="text-xs font-extrabold text-slate-500">{{ i18n.t('label.email') }}</span>
            <input
              class="h-11 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              type="email"
              [(ngModel)]="email"
              placeholder="you@example.com"
              autocomplete="username"
            />
          </label>

          <label class="grid gap-1">
            <span class="text-xs font-extrabold text-slate-500">{{ i18n.t('label.password') }}</span>
            <div class="relative">
              <input
                class="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-11 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                [type]="passwordVisible ? 'text' : 'password'"
                [(ngModel)]="password"
                placeholder="********"
                autocomplete="current-password"
                (keydown.enter)="signIn()"
              />
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                type="button"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="i18n.t(passwordVisible ? 'action.hide_password' : 'action.show_password')"
                [attr.aria-pressed]="passwordVisible"
              >
                <shared-icon [name]="passwordVisible ? 'eye_off' : 'eye'" [size]="18"></shared-icon>
              </button>
            </div>
          </label>
        </div>

        <div class="mt-5 grid gap-2">
          <button class="h-11 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 dark:hover:bg-slate-600" type="button" (click)="signIn()">
            {{ i18n.t('action.sign_in') }}
          </button>
          <button
            class="h-11 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold hover:bg-slate-50"
            type="button"
            (click)="demoSignIn()"
          >
            {{ i18n.t('action.use_test_account') }}
          </button>
        </div>

        <div class="mt-4 text-center">
          <button
            class="text-sm font-extrabold text-sky-600 hover:underline"
            type="button"
            (click)="toast.show(i18n.t('toast.password_reset_not_implemented'))"
          >
            {{ i18n.t('action.forgot_password') }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LoginPage implements OnInit {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  readonly domainStore = inject(DomainStore);
  private readonly userStore = inject(UserStore);
  readonly toast = inject(ToastService);
  readonly i18n = inject(I18nStore);
  readonly languageOptions = this.i18n.languageOptions;

  email = '';
  password = '';
  passwordVisible = false;

  ngOnInit() {
    if (!this.domainStore.hasDomain()) {
      void this.router.navigateByUrl('/domen');
      return;
    }
    if (this.auth.isSignedIn()) void this.router.navigateByUrl('/dashboard');
  }

  async signIn() {
    if (!this.email.trim() || !this.password.trim()) {
      this.toast.show(this.i18n.t('toast.sign_in_missing'));
      return;
    }
    const email = this.email.trim();
    try {
      await this.auth.signIn(email, this.password);
      await this.userStore.updateUser({ email });
      void this.router.navigateByUrl('/dashboard');
      this.password = '';
      this.toast.show(this.i18n.t('toast.signed_in'));
    } catch (error) {
      this.toast.show(getLoginErrorMessage(error, this.i18n));
    }
  }

  async demoSignIn() {
    if (!hasTestAccount()) {
      this.toast.show(this.i18n.t('toast.test_account_missing'));
      return;
    }
    this.email = TEST_ACCOUNT.email;
    this.password = TEST_ACCOUNT.password;
    await this.signIn();
  }

  changeDomain() {
    void this.router.navigateByUrl('/domen');
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  setLocale(value: string) {
    if (!isSupportedLocale(value)) return;
    this.i18n.setLocale(value);
  }

}

const TEST_ACCOUNT = {
  email: 'test@test.com',
  password: 'test',
};

function hasTestAccount() {
  return Boolean(TEST_ACCOUNT.email && TEST_ACCOUNT.password);
}

function getLoginErrorMessage(error: unknown, i18n: I18nStore): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return i18n.t('error.network');
    if (error.status === 401 || error.status === 403) return i18n.t('error.invalid_credentials');
    const detail = readErrorDetail(error.error);
    if (detail) return detail;
    return i18n.t('error.sign_in_failed');
  }
  if (error instanceof Error && error.message) return error.message;
  return i18n.t('error.sign_in_failed');
}

function readErrorDetail(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object' && payload !== null && 'detail' in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: unknown } | null;
      if (first && typeof first.msg === 'string') return first.msg;
    }
  }
  return null;
}
