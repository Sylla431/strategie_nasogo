"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  description?: string;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Gestion",
    items: [
      {
        href: "/admin/courses",
        label: "Cours",
        description: "Créer et gérer les vidéos",
      },
      {
        href: "/admin/access",
        label: "Accès",
        description: "Accorder l'accès aux cours",
      },
      {
        href: "/admin/telegram",
        label: "Telegram VIP",
        description: "Abonnements canal signaux",
      },
    ],
  },
  {
    title: "Communauté",
    items: [
      {
        href: "/admin/students",
        label: "Étudiants",
        description: "Liste et fiches",
      },
    ],
  },
];

function isNavActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarCard({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="border-b border-neutral-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">VB Sniper</p>
        <h2 className="mt-0.5 text-lg font-semibold text-neutral-900">Administration</h2>
      </div>

      <nav className="flex-1 space-y-5 px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={[
                      "block rounded-xl px-3 py-2.5 transition-colors",
                      active
                        ? "border border-brand/30 bg-brand/15 text-neutral-900"
                        : "border border-transparent text-neutral-700 hover:bg-neutral-100",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs text-neutral-500">{item.description}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-neutral-200 px-3 py-4">
        <Link
          href="/services/strategie-nasongon"
          className="button-secondary w-full text-center text-sm"
          onClick={onNavigate}
        >
          Retour au site
        </Link>
        <Link
          href="/client"
          className="pill-neutral block w-full py-2 text-center text-sm"
          onClick={onNavigate}
        >
          Espace client
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-base">
      <div className="flex min-h-screen gap-4 p-4 lg:gap-6 lg:p-6">
        {/* Desktop floating sidebar */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)]">
            <SidebarCard />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Fermer le menu"
            onClick={closeMobile}
          />
        )}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-[min(300px,88vw)] p-3 transition-transform lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="h-full">
            <SidebarCard onNavigate={closeMobile} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 mb-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur-sm lg:hidden">
            <button
              type="button"
              className="button-secondary px-3 py-2 text-sm"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              Menu
            </button>
            <p className="text-sm font-semibold text-neutral-900">Administration</p>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
