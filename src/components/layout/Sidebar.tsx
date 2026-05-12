import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Hammer, 
  ShoppingCart, 
  Users, 
  LogOut,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { profile, logOut } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'artisan', 'showroom'] },
    { to: '/production', icon: Hammer, label: 'Production', roles: ['admin', 'artisan'] },
    { to: '/sales', icon: ShoppingCart, label: 'Sales & POS', roles: ['admin', 'showroom'] },
    { to: '/admin', icon: Users, label: 'Staff Management', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (profile && item.roles.includes(profile.role))
  );

  return (
    <aside className="w-64 h-screen bg-[#141414] text-[#E4E3E0] border-r border-[#333] flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-8 pb-4">
        <h1 className="font-serif italic text-2xl tracking-tight text-white mb-1">Timber & Trade</h1>
        <p className="font-mono text-[10px] uppercase opacity-50 tracking-widest font-bold">Systems v1.02</p>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 group relative",
              isActive 
                ? "text-white bg-white/10" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-white")} />
                <span className="font-medium tracking-tight">{item.label}</span>
                {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-white" />}
                <ChevronRight className={cn("w-3 h-3 ml-auto opacity-0 transition-all", isActive && "opacity-100 transform translate-x-1")} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-[#333]">
        <div className="flex items-center gap-3 px-4 py-4 mb-2">
          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold select-none border border-zinc-700">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate text-zinc-100">{profile?.name}</span>
            <span className="text-[10px] uppercase font-mono opacity-50 tracking-wider truncate">[{profile?.role}]</span>
          </div>
        </div>
        
        <button
          onClick={() => logOut()}
          className="flex items-center gap-3 w-full px-4 py-3 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-900/10 transition-colors rounded group"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-bold uppercase tracking-widest">Logout System</span>
        </button>
      </div>
    </aside>
  );
}
