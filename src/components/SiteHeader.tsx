"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const store = {
  name: "VB Sniper Académie",
  description:
    "À travers mes divers programmes de formation et de coaching, j'accompagne des traders particuliers depuis 2022.",
  logoUrl: "/logo/logo.png",
  support: {
    whatsapp: "https://wa.me/+22373695125",
    email: "mailto:vbsnipergroupe@gmail.com",
    phone: "+223 73 69 51 25",
  },
};

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#services", label: "Services" },
];

type SiteHeaderProps = {
  /** "light" = barre sticky blanche (pages de vente) ; "hero" = overlay transparent sur fond sombre (accueil) */
  variant?: "light" | "hero";
};

export default function SiteHeader({ variant = "light" }: SiteHeaderProps) {
  const pathname = usePathname();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roleLoadError, setRoleLoadError] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      const uid = data.session?.user?.id ?? null;
      const emailVal = data.session?.user?.email ?? null;
      setSessionToken(token);
      setUserEmail(emailVal);
      setUserId(uid);
      setRoleLoadError(null);
      if (token && uid) {
        const readRole = async () => {
          const { data: profile, error } = await supabase
            .from("users_profile")
            .select("role")
            .eq("id", uid)
            .maybeSingle();
          if (error) {
            setRoleLoadError(error.message);
            return null;
          }
          const roleVal =
            (profile?.role && typeof profile.role === "string"
              ? profile.role.trim().toLowerCase()
              : null) ?? null;
          return roleVal;
        };

        let roleVal = await readRole();
        if (!roleVal) {
          const { error: upErr } = await supabase.from("users_profile").upsert({ id: uid });
          if (upErr) {
            setRoleLoadError(upErr.message);
          } else {
            roleVal = await readRole();
          }
        }
        setUserRole(roleVal === "admin" ? "admin" : roleVal);
      } else {
        setUserRole(null);
        setUserId(null);
        setUserEmail(null);
        setRoleLoadError(null);
        setUserMenuOpen(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setSessionToken(null);
        setUserRole(null);
        setUserId(null);
        setUserEmail(null);
        setRoleLoadError(null);
        setUserMenuOpen(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        loadSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      setSessionToken(null);
      setUserRole(null);
      setUserEmail(null);
      setUserId(null);
      setRoleLoadError(null);
      setUserMenuOpen(false);

      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      window.location.href = "/";
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return false;
  };

  const navLinkClass = (href: string) =>
    `text-xs sm:text-sm whitespace-nowrap transition-colors ${
      variant === "hero"
        ? isActive(href)
          ? "text-[#d4af37] font-semibold"
          : "text-white/85 hover:text-[#d4af37]"
        : isActive(href)
          ? "pill-neutral text-brand font-semibold"
          : "pill-neutral"
    }`;

  const sessionActions = (
    <>
      {sessionToken ? (
        <>
          {userRole !== "admin" && (
            <Link
              href="/client"
              className={
                variant === "hero"
                  ? "inline-flex items-center rounded-full border border-[#d4af37]/50 bg-black/50 backdrop-blur-sm px-3 py-1.5 text-xs sm:text-sm font-semibold !text-white hover:bg-[#d4af37] hover:!text-black transition-colors"
                  : "pill-neutral text-xs sm:text-sm whitespace-nowrap"
              }
            >
              Espace client
            </Link>
          )}
          {userRole === "admin" && (
            <>
              <Link
                href="/admin"
                className={
                  variant === "hero"
                    ? "inline-flex items-center rounded-full border border-[#d4af37]/50 bg-[#d4af37] px-3 py-1.5 text-xs sm:text-sm font-semibold !text-black hover:bg-[#f4d03f] transition-colors"
                    : "pill-neutral text-xs sm:text-sm whitespace-nowrap"
                }
              >
                Admin
              </Link>
              {variant === "light" && (
                <Link href="/admin/students" className="pill-neutral text-xs sm:text-sm whitespace-nowrap">
                  Étudiants
                </Link>
              )}
            </>
          )}
          <div className="relative">
            <button
              type="button"
              className={
                variant === "hero"
                  ? "h-10 w-10 rounded-full border border-[#d4af37]/50 bg-black/50 backdrop-blur-sm grid place-items-center hover:bg-[#d4af37]/20"
                  : "h-10 w-10 rounded-full border border-[#d4af37]/40 bg-white shadow-sm grid place-items-center hover:bg-[rgba(212,175,55,0.08)]"
              }
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Profil"
              aria-haspopup="dialog"
              aria-expanded={userMenuOpen}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
                  stroke={variant === "hero" ? "white" : "currentColor"}
                  strokeWidth="2"
                />
                <path
                  d="M20 22a8 8 0 1 0-16 0"
                  stroke={variant === "hero" ? "white" : "currentColor"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  role="dialog"
                  aria-label="Profil utilisateur"
                  className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-64 max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 sm:p-4 shadow-xl z-50"
                >
                  <p className="text-sm text-neutral-600 font-medium">Connecté en tant que</p>
                  <p className="font-semibold text-base break-all mt-1 text-neutral-900">
                    {userEmail ?? "Utilisateur"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="badge-soft text-brand text-xs sm:text-sm">
                      Rôle : {userRole ?? "client"}
                    </span>
                  </div>
                  {userId && (
                    <p className="mt-2 text-xs text-neutral-500 break-all">ID: {userId}</p>
                  )}
                  {roleLoadError && (
                    <p className="mt-2 text-xs text-red-600 break-all">
                      Erreur rôle: {roleLoadError}
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/client"
                      className="pill-neutral w-full text-center text-sm sm:text-base"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Espace client
                    </Link>
                    {userRole === "admin" && (
                      <>
                        <Link
                          href="/admin"
                          className="pill-neutral w-full text-center text-sm sm:text-base"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin
                        </Link>
                        <Link
                          href="/admin/students"
                          className="pill-neutral w-full text-center text-sm sm:text-base"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Étudiants
                        </Link>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-4 button-primary w-full cta-pulse text-sm sm:text-base"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <Link
          href="/auth"
          className={
            variant === "hero"
              ? "inline-flex items-center rounded-full border border-white/30 bg-black/50 backdrop-blur-sm px-3 py-1.5 text-xs sm:text-sm font-semibold !text-white hover:border-[#d4af37] hover:!text-[#d4af37] transition-colors"
              : "button-primary cta-pulse text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4"
          }
        >
          Connexion
        </Link>
      )}
    </>
  );

  if (variant === "hero") {
    return (
      <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0 sm:p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#d4af37]/60 bg-black/50 backdrop-blur-sm shadow-md"
          >
            <Image src={store.logoUrl} alt={store.name} fill sizes="48px" className="object-contain" />
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-3 py-1.5 ${navLinkClass(link.href)}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-right space-y-3">
          <div>
            <p className="text-sm text-white font-medium mb-1">Contactez-moi</p>
            <a
              href={store.support.email}
              className="text-base text-brand font-semibold hover:text-[#f4d03f] transition-colors"
            >
              {store.support.email.replace("mailto:", "")}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">{sessionActions}</div>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-lg p-4 border-b border-[#e1e3eb]">
      <div className="layout-shell flex flex-wrap items-center justify-between gap-3 sm:gap-4 py-4">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#d4af37]/60 bg-black shadow-md">
            <Image src={store.logoUrl} alt={store.name} fill sizes="64px" className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-neutral-900">{store.name}</p>
            <p className="text-xs text-neutral-700 sm:hidden">Formations et coaching depuis 2022.</p>
            <p className="hidden 2xl:block text-sm text-neutral-800 truncate max-w-md">{store.description}</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
          <nav className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href={store.support.whatsapp} target="_blank" className="pill-neutral text-xs sm:text-sm whitespace-nowrap">
            Besoin d&apos;aide ?
          </Link>
          {sessionActions}
        </div>
      </div>
    </header>
  );
}
