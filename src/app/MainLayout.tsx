import { Menu, X, LogOut, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { PropsWithChildren, useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { SubscriptionBanner } from '../components/SubscriptionBanner';
import { NAV_LINKS } from '../shared/constants';

export function formatName(value: string): string {
  if (!value) return value;

  return value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}


export const MainLayout = ({ children }: PropsWithChildren) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user, userProfile, signOut, isAuthenticated } = useSupabaseAuth();

  const toggleNav = () => setIsNavOpen((prev) => !prev);
  const closeNav = () => setIsNavOpen(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getUsername = () => {
    if (!userProfile) return '';
    const username = formatName(userProfile.username) || formatName(userProfile.firstName)|| '';
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SubscriptionBanner />
      <div className="flex min-h-screen">
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white/90 px-4 py-4 shadow-xl backdrop-blur transition-transform duration-300',
            isNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-slate-900" onClick={closeNav}>
              <div className="rounded-2xl bg-slate-900 px-2.5 py-1 text-sm text-white">SB</div>
              <div>
                <p>SalesBook</p>
                <p className="text-xs font-normal text-slate-500">Vos ventes, enfin organisées.</p>
              </div>
            </Link>
            <button className="rounded-full border border-slate-200 p-2 text-slate-600 md:hidden" onClick={closeNav}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="mt-8 space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeNav}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-500">
            {isAuthenticated && userProfile && (
              <div className="mb-3 pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">
                      {getUsername()}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {user?.email}
                </p>
              </div>
            )}
            <p className="text-sm font-semibold text-slate-900">SalesBook</p>
            {/*<p>Version {APP_VERSION}</p>*/}
            <p>
              Produit par <span className="font-semibold text-slate-900">AEK Group</span>
            </p>
          </div>
        </aside>
        {isNavOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={closeNav} />}
        <div className="flex flex-1 flex-col md:ml-64 lg:ml-72">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex w-full items-center justify-between gap-3 px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 md:hidden"
                  onClick={toggleNav}
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Salesbook</p>
                  <p className="text-lg font-semibold text-slate-900">Tableau d’administration</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isAuthenticated && userProfile && (
                  <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {getUsername()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      title="Se déconnecter"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {/*<div className="hidden text-sm font-medium text-slate-500 md:block">Version {APP_VERSION}</div>*/}
              </div>
            </div>
          </header>
          <div className="flex-1 p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
