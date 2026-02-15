import React from 'react';
import { UserRole } from '../types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div className="relative group z-[200]">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-card dark:bg-card-dark border border-border rounded-xl hover:bg-muted transition-all focus:outline-none shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="material-icons text-primary text-lg">
            {currentRole === UserRole.ADMIN ? 'admin_panel_settings' : 
             currentRole === UserRole.CAMP_MANAGER ? 'manage_accounts' : 'person'}
          </span>
        </div>
        <div className="text-left hidden sm:block pr-2">
          <p className="text-[9px] text-muted-foreground font-black uppercase leading-none tracking-widest">Portal Access</p>
          <p className="text-xs font-black leading-none mt-1 text-foreground">
            {currentRole === UserRole.ADMIN ? 'Administrator' : 
             currentRole === UserRole.CAMP_MANAGER ? 'Camp Manager' : 'Field Volunteer'}
          </p>
        </div>
        <span className="material-icons text-muted-foreground text-sm">expand_more</span>
      </button>

      <div className="absolute right-0 mt-2 w-64 bg-card dark:bg-card-dark border border-border rounded-2xl shadow-2xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-[300] overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Switch Environment</p>
        </div>
        <div className="p-2 space-y-1">
          <button 
            onClick={() => onRoleChange(UserRole.ADMIN)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${currentRole === UserRole.ADMIN ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <span className={`material-icons text-sm ${currentRole === UserRole.ADMIN ? 'text-primary-foreground' : 'text-primary'}`}>security</span>
            <div className="flex-1">
              <p className="text-xs font-black leading-none">Global Admin</p>
              <p className={`text-[10px] mt-1 ${currentRole === UserRole.ADMIN ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Full access control</p>
            </div>
          </button>

          <button 
            onClick={() => onRoleChange(UserRole.CAMP_MANAGER)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${currentRole === UserRole.CAMP_MANAGER ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <span className={`material-icons text-sm ${currentRole === UserRole.CAMP_MANAGER ? 'text-primary-foreground' : 'text-primary'}`}>holiday_village</span>
            <div className="flex-1">
              <p className="text-xs font-black leading-none">Camp Manager</p>
              <p className={`text-[10px] mt-1 ${currentRole === UserRole.CAMP_MANAGER ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Site-specific ops</p>
            </div>
          </button>

          <button 
            onClick={() => onRoleChange(UserRole.VOLUNTEER)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${currentRole === UserRole.VOLUNTEER ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <span className={`material-icons text-sm ${currentRole === UserRole.VOLUNTEER ? 'text-primary-foreground' : 'text-primary'}`}>volunteer_activism</span>
            <div className="flex-1">
              <p className="text-xs font-black leading-none">Volunteer</p>
              <p className={`text-[10px] mt-1 ${currentRole === UserRole.VOLUNTEER ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Field task management</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
