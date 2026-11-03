import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { getNotifications, type AnimalNotification } from '../services/api';
import Badge from './Badge';
import Button from './Button';

type HeaderProps = {
  isAuthenticated?: boolean;
};

function PawIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <g transform="rotate(-8 12 12)">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.5 13.5c.5-1.4 2.1-1.7 3.5-.7 1.4-1 3-.7 3.5.7.6 1.8-.2 4.6-1.9 4.6-.8 0-1.2-.5-1.6-.5s-.8.5-1.6.5c-1.7 0-2.5-2.8-1.9-4.6Z"
        />
        <ellipse cx="6.5" cy="9" rx="1.7" ry="2.4" />
        <ellipse cx="10" cy="6.5" rx="1.7" ry="2.4" />
        <ellipse cx="14" cy="6.5" rx="1.7" ry="2.4" />
        <ellipse cx="17.5" cy="9" rx="1.7" ry="2.4" />
      </g>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export default function Header({ isAuthenticated: propIsAuth }: HeaderProps) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<AnimalNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const authenticated = propIsAuth ?? Boolean(user);

  useEffect(() => {
    if (authenticated) {
      getNotifications()
        .then((data) => setNotifications(data))
        .catch(() => {
          // Si l'utilisateur n'a pas encore d'animaux ou erreur réseau bénigne
          setNotifications([]);
        });
    } else {
      setNotifications([]);
    }
  }, [authenticated]);

  // Fermeture des popups lors d'un clic en dehors ou appui sur Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotifOpen(false);
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fermeture automatique lors d'un changement de page
  useEffect(() => {
    setIsNotifOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Défilement automatique fluide vers l'ancre si présente dans l'URL
  useEffect(() => {
    if (!location.hash) return;
    const hashId = location.hash.replace('#', '');

    const scrollToTarget = () => {
      const el = document.getElementById(hashId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return true;
      }
      return false;
    };

    if (!scrollToTarget()) {
      const t1 = setTimeout(scrollToTarget, 100);
      const t2 = setTimeout(scrollToTarget, 300);
      const t3 = setTimeout(scrollToTarget, 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [location.pathname, location.hash]);

  const criticalCount = notifications.filter((n) => n.severity === 'critical').length;
  const warningCount = notifications.filter((n) => n.severity === 'warning').length;

  function closeMenus() {
    setIsNotifOpen(false);
    setIsMenuOpen(false);
  }

  function handleAnchorNav(targetPath: string, hashId: string) {
    closeMenus();

    if (location.pathname === targetPath) {
      const el = document.getElementById(hashId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      window.history.pushState(null, '', `${targetPath}#${hashId}`);
      return;
    }

    navigate(`${targetPath}#${hashId}`);
  }

  function handleAuthClick() {
    closeMenus();
    if (authenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-8 sm:py-4">
        <Link className="flex items-center gap-2 text-left" to="/">
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <PawIcon />
          </span>
          <span>
            <span className="block text-base sm:text-lg font-bold tracking-tight text-slate-900">
              HandyVet
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">
              Le bien-être de vos compagnons
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {authenticated && (
            <span className="hidden text-sm font-medium text-slate-700 sm:inline-block mr-1">
              Bonjour, {user?.firstName ?? 'Vétérinaire'}
            </span>
          )}

          {/* Cloche de notifications */}
          {authenticated && (
            <div className="relative" ref={notifRef}>
              <button
                aria-expanded={isNotifOpen}
                aria-haspopup="dialog"
                aria-label="Notifications et alertes de suivi"
                className={`relative flex cursor-pointer items-center justify-center rounded-lg p-2 transition ${
                  isNotifOpen
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => {
                  setIsNotifOpen((prev) => !prev);
                  setIsMenuOpen(false);
                }}
                type="button"
              >
                <BellIcon />
                {notifications.length > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm ${
                      criticalCount > 0
                        ? 'bg-red-500 animate-pulse'
                        : warningCount > 0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  >
                    {notifications.length}
                  </span>
                )}
              </button>
              {isNotifOpen && (
                <div className="fixed inset-x-2.5 top-14 z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 sm:z-20">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-sm font-bold text-slate-900">
                      Alertes & Suivi santé
                    </span>
                    <div className="flex items-center gap-1.5">
                      {criticalCount > 0 && (
                        <Badge variant="danger">{criticalCount} critique{criticalCount > 1 ? 's' : ''}</Badge>
                      )}
                      {warningCount > 0 && (
                        <Badge variant="warning">{warningCount} important{warningCount > 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 max-h-72 space-y-2 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center">
                        <p className="text-2xl">✨</p>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          Tout est à jour !
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Aucun retard de soin ou rendez-vous en attente.
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((notif) => (
                        <div
                          className={`rounded-lg border p-2.5 text-xs transition ${
                            notif.severity === 'critical'
                              ? 'border-red-200 bg-red-50/60'
                              : notif.severity === 'warning'
                                ? 'border-amber-200 bg-amber-50/60'
                                : 'border-blue-200 bg-blue-50/40'
                          }`}
                          key={notif.id}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-slate-900 truncate">
                              {notif.animalName} • {notif.title}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                                notif.severity === 'critical'
                                  ? 'bg-red-200 text-red-900'
                                  : notif.severity === 'warning'
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-blue-200 text-blue-900'
                              }`}
                            >
                              {notif.severity === 'critical'
                                ? 'Critique'
                                : notif.severity === 'warning'
                                  ? 'Important'
                                  : 'Rappel'}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="mt-2 text-right">
                            <Link
                              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
                              onClick={closeMenus}
                              to={`/animals/${notif.animalId}/edit`}
                            >
                              Mettre à jour &rarr;
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-2.5 border-t border-slate-100 pt-2 text-center">
                    <Link
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      onClick={closeMenus}
                      to="/dashboard"
                    >
                      Voir le tableau de bord complet &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Menu classique */}
          <div className="relative" ref={menuRef}>
            <button
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className={`flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-2 sm:px-3 text-sm font-medium transition ${
                isMenuOpen
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
                setIsNotifOpen(false);
              }}
              type="button"
            >
              Menu
              <svg
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50">
                <Link
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={closeMenus}
                  to="/"
                >
                  Accueil
                </Link>
                {authenticated && (
                  <>
                    <Link
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={closeMenus}
                      to="/dashboard"
                    >
                      🐾 Mes animaux
                    </Link>
                    <Link
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={closeMenus}
                      to="/profile"
                    >
                      👤 Mon profil
                    </Link>
                    <Link
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={closeMenus}
                      to="/animals/new"
                    >
                      + Ajouter un animal
                    </Link>
                    <button
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => handleAnchorNav('/dashboard', 'alertes')}
                      type="button"
                    >
                      🔔 Rappels & rendez-vous
                    </button>
                  </>
                )}
                <button
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => handleAnchorNav('/', 'guide-sante')}
                  type="button"
                >
                  💡 Conseils & guide santé
                </button>

                {/* Boutons d'authentification pour mobile */}
                {authenticated ? (
                  <div className="mt-1 border-t border-slate-100 pt-1 sm:hidden">
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      onClick={() => {
                        closeMenus();
                        void logout();
                        navigate('/login');
                      }}
                      type="button"
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 border-t border-slate-100 pt-1 sm:hidden">
                    <Link
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      onClick={closeMenus}
                      to="/login"
                    >
                      Connexion
                    </Link>
                    <Link
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                      onClick={closeMenus}
                      to="/register"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading && !user ? (
            <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse hidden sm:block" />
          ) : (
            <>
              {!authenticated && (
                <Button
                  className="hidden sm:inline-flex"
                  onClick={() => navigate('/register')}
                  variant="secondary"
                >
                  Inscription
                </Button>
              )}

              <Button
                className="hidden sm:inline-flex"
                onClick={handleAuthClick}
                variant={authenticated ? 'outline' : 'primary'}
              >
                {authenticated ? 'Déconnexion' : 'Connexion'}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
