import { Home, CalendarPlus, BarChart2, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const links = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/create', icon: CalendarPlus, label: '创建' },
    { to: '/stats', icon: BarChart2, label: '统计' },
    { to: '/profile', icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 pb-safe pt-2 px-6 z-50 print:hidden shrink-0">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 p-2 min-w-[64px]',
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                )
              }
            >
              <Icon size={24} strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
