import { CommonModule } from '@angular/common';
import { Component, HostListener, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '@features/auth/model/auth.store';
import { NotificationsStore } from '@features/notifications/model/notifications.store';
import { OrgId, OrgStore } from '@features/org/model/org.store';
import { ThemeStore } from '@features/theme/model/theme.store';
import { CourseStore } from '@entities/course/model/course.store';
import { UserStore } from '@entities/user/model/user.store';
import { ToastService } from '@shared/ui/toast/toast.service';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { IconName } from '@shared/ui/icon/icon.types';
import { I18nStore, MessageKey, isSupportedLocale } from '@shared/i18n/i18n.store';

type NavGroup = {
  titleKey: MessageKey;
  items: { labelKey: MessageKey; to: string; icon: IconName }[];
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  template: `
    <div class="h-full grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside class="hidden md:flex flex-col bg-white border-r border-slate-200 min-h-0">
        <div class="flex items-center gap-3 px-4 py-4">
          <div
            class="h-10 w-10 rounded-2xl bg-emerald-500 text-white font-black flex items-center justify-center"
            aria-hidden="true"
          >
            <shared-icon name="logo" [size]="24"></shared-icon>
          </div>
          <div>
            <div class="text-sm font-extrabold leading-tight tracking-tight">Brooklyn LMS</div>
            <div class="text-xs font-semibold text-slate-500">{{ i18n.t('app.tagline') }}</div>
          </div>
        </div>

        <nav class="flex-1 min-h-0 overflow-auto px-2 pb-3">
          @for (group of navGroups; track group.titleKey) {
            <div class="mt-4">
              <div class="px-3 pb-2 text-[11px] font-extrabold tracking-[0.12em] text-slate-400 uppercase">
                {{ i18n.t(group.titleKey) }}
              </div>
              <div class="grid gap-1">
                @for (item of group.items; track item.to) {
                  <a
                    class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    [routerLink]="item.to"
                    routerLinkActive="bg-emerald-50 text-emerald-700"
                  >
                    <shared-icon [name]="item.icon" [size]="18"></shared-icon>
                    {{ i18n.t(item.labelKey) }}
                  </a>
                }
              </div>
            </div>
          }
        </nav>

        <div class="relative border-t border-slate-200 px-3 py-3">
          <button
            class="w-full flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-slate-50"
            type="button"
            (click)="toggleUserMenu($event)"
          >
            <div
              class="h-10 w-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center overflow-hidden shrink-0"
              aria-hidden="true"
            >
              @if (user().avatar_url) {
                <img class="h-full w-full object-cover" [src]="user().avatar_url" alt="" />
              } @else {
                {{ userInitials() }}
              }
            </div>
            <div class="min-w-0 flex-1 text-left">
              <div class="truncate text-sm font-semibold text-slate-900">{{ userFullName() }}</div>
              <div class="truncate text-xs font-semibold text-slate-500">{{ user().email }}</div>
            </div>
            <span class="text-slate-400" aria-hidden="true">
              <shared-icon name="chevron_down" [size]="18"></shared-icon>
            </span>
          </button>

          @if (userMenuOpen) {
            <div class="absolute left-3 right-3 bottom-[72px] z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              <button class="menu-item" type="button" (click)="goToProfile()">{{ i18n.t('nav.profile') }}</button>
              <button class="menu-item" type="button" (click)="goToSecurity()">{{ i18n.t('nav.security') }}</button>
              <button class="menu-item text-rose-700 hover:bg-rose-50" type="button" (click)="signOut()">
                {{ i18n.t('action.sign_out') }}
              </button>
            </div>
          }
        </div>
      </aside>

      <div class="min-w-0 flex flex-col min-h-0">
        <header class="relative bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <div class="flex items-center gap-3 shrink-0">
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              type="button"
              (click)="toggleOrgMenu($event)"
            >
              <span class="truncate max-w-[160px]">{{ orgLabelText(orgLabel()) }}</span>
              <span class="text-slate-400" aria-hidden="true">
                <shared-icon name="chevron_down" [size]="18"></shared-icon>
              </span>
            </button>
          </div>

          <div class="flex-1 flex justify-center min-w-0">
            <div class="hidden sm:flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 w-[520px] max-w-[52vw]">
              <span class="text-slate-400">
                <shared-icon name="search" [size]="18"></shared-icon>
              </span>
              <input
                class="w-full bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                type="text"
                [placeholder]="i18n.t('header.search_placeholder')"
                [(ngModel)]="search"
                (keydown.enter)="submitSearch()"
              />
              <kbd
                class="shrink-0 whitespace-nowrap rounded-lg border border-emerald-100 bg-white/70 px-2 py-1 text-[11px] font-extrabold text-slate-500 text-center dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300"
              >
                Ctrl K
              </kbd>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <select
              class="h-10 rounded-xl border border-slate-200 bg-white/80 px-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-600 outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              [ngModel]="i18n.locale()"
              (ngModelChange)="setLocale($event)"
              [attr.aria-label]="i18n.t('label.language')"
            >
              @for (option of languageOptions; track option.id) {
                <option [value]="option.id">{{ option.label }}</option>
              }
            </select>
            <button class="icon-btn" type="button" (click)="toggleNotifications()">
              <shared-icon [name]="notificationsEnabled() ? 'bell_off' : 'bell'" [size]="20"></shared-icon>
            </button>
            <button class="icon-btn" type="button" (click)="toggleTheme()">
              <shared-icon [name]="theme() === 'dark' ? 'sun' : 'moon'" [size]="20"></shared-icon>
            </button>
          </div>

          @if (orgMenuOpen) {
            <div class="absolute left-4 top-14 z-40 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              <button class="menu-item" type="button" (click)="selectOrg('Marketplace')">
                {{ i18n.t('org.marketplace') }}
              </button>
              <button class="menu-item" type="button" (click)="selectOrg('B2B Tenant')">{{ i18n.t('org.b2b_tenant') }}</button>
              <button class="menu-item" type="button" (click)="selectOrg('Demo')">{{ i18n.t('org.demo') }}</button>
            </div>
          }
        </header>

        <main class="flex-1 min-h-0 overflow-auto p-5">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .menu-item {
        width: 100%;
        border: none;
        background: transparent;
        padding: 10px 10px;
        border-radius: 10px;
        text-align: left;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        color: inherit;
      }

      .menu-item:hover {
        background: #f8fafc;
      }

      .icon-btn {
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 12px;
        height: 40px;
        width: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 0;
        cursor: pointer;
        color: #334155;
      }

      .icon-btn:hover {
        background: #f1f5f9;
      }

      :host-context(.dark) .menu-item:hover {
        background: #1e293b;
      }

      :host-context(.dark) .icon-btn {
        border-color: #475569;
        background: #1f2937;
        color: #e2e8f0;
      }

      :host-context(.dark) .icon-btn:hover {
        background: #334155;
      }
    `,
  ],
})
export class AppShellComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly userStore = inject(UserStore);
  private readonly courseStore = inject(CourseStore);
  private readonly orgStore = inject(OrgStore);
  private readonly themeStore = inject(ThemeStore);
  private readonly notificationsStore = inject(NotificationsStore);
  readonly i18n = inject(I18nStore);

  readonly user = this.userStore.user;
  readonly userFullName = this.userStore.fullName;
  readonly userInitials = this.userStore.initials;
  readonly orgLabel = this.orgStore.org;
  readonly theme = this.themeStore.theme;
  readonly notificationsEnabled = this.notificationsStore.enabled;
  readonly languageOptions = this.i18n.languageOptions;

  orgMenuOpen = false;
  search = '';
  userMenuOpen = false;

  navGroups: NavGroup[] = [
    {
      titleKey: 'nav.group.learning',
      items: [
        { labelKey: 'nav.dashboard', to: '/dashboard', icon: 'dashboard' },
        { labelKey: 'nav.courses', to: '/courses', icon: 'courses' },
        { labelKey: 'nav.lessons', to: '/lessons', icon: 'lessons' },
        { labelKey: 'nav.quizzes', to: '/quizzes', icon: 'quizzes' },
        { labelKey: 'nav.tests', to: '/tests', icon: 'tests' },
        { labelKey: 'nav.downloads', to: '/downloads', icon: 'downloads' },
      ],
    },
    {
      titleKey: 'nav.group.tools',
      items: [
        { labelKey: 'nav.notebook', to: '/notebook', icon: 'notebook' },
        { labelKey: 'nav.ai_tutor', to: '/ai-tutor', icon: 'ai_tutor' },
      ],
    },
    {
      titleKey: 'nav.group.account',
      items: [
        { labelKey: 'nav.profile', to: '/profile', icon: 'profile' },
        { labelKey: 'nav.security', to: '/security', icon: 'security' },
      ],
    },
  ];

  constructor() {
    effect(
      () => {
        void this.courseStore.loadForOrg(this.orgLabel());
      },
      { allowSignalWrites: true },
    );
  }

  toggleOrgMenu(event: MouseEvent) {
    event.stopPropagation();
    this.orgMenuOpen = !this.orgMenuOpen;
  }

  selectOrg(label: OrgId) {
    this.orgStore.setOrg(label);
    this.orgMenuOpen = false;
    this.toast.show(this.i18n.t('toast.switched_org', { org: this.orgLabelText(label) }));
  }

  submitSearch() {
    const q = this.search.trim();
    this.courseStore.setSearchQuery(q);
    if (!q) return;
    void this.router.navigateByUrl('/courses');
    this.toast.show(this.i18n.t('toast.search', { query: q }));
  }

  async signOut() {
    this.userMenuOpen = false;
    await this.auth.signOut();
    void this.router.navigateByUrl('/login');
    this.toast.show(this.i18n.t('toast.signed_out'));
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToProfile() {
    this.userMenuOpen = false;
    void this.router.navigateByUrl('/profile');
  }

  goToSecurity() {
    this.userMenuOpen = false;
    void this.router.navigateByUrl('/security');
  }

  toggleTheme() {
    this.themeStore.toggle();
    this.toast.show(this.i18n.t(this.themeStore.theme() === 'dark' ? 'toast.theme_dark' : 'toast.theme_light'));
  }

  toggleNotifications() {
    this.notificationsStore.toggle();
    this.toast.show(
      this.i18n.t(this.notificationsStore.enabled() ? 'toast.notifications_on' : 'toast.notifications_off'),
    );
  }

  setLocale(value: string) {
    if (!isSupportedLocale(value)) return;
    this.i18n.setLocale(value);
    void this.userStore.updateUser({ language_preference: value });
  }

  orgLabelText(org: OrgId) {
    switch (org) {
      case 'Marketplace':
        return this.i18n.t('org.marketplace');
      case 'Demo':
        return this.i18n.t('org.demo');
      default:
        return this.i18n.t('org.b2b_tenant');
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.orgMenuOpen = false;
    this.userMenuOpen = false;
  }
}
