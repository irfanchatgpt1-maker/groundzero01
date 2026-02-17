import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';
import { RoleSwitcher } from './RoleSwitcher';
import { useInventory } from '@/hooks/use-inventory';
import { useShipments } from '@/hooks/use-shipments';
import { useVolunteerTasks } from '@/hooks/use-volunteer-tasks';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export const VolunteerDashboard: React.FC<{ onRoleChange: (role: UserRole) => void }> = ({ onRoleChange }) => {
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Local supplies (no camp_id = null means global, but volunteer sees local inventory)
  const { data: localSupplies = [], isLoading: suppliesLoading } = useInventory();
  const { data: inboundShipments = [], isLoading: shipmentsLoading } = useShipments({ destination: 'Sector 4' });
  const { data: tasks = [] } = useVolunteerTasks('Alex Johnson');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');

  const renderContent = () => {
    switch (activeSidebar) {
      case 'Dashboard':
        return (
          <motion.div key="vol-dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={staggerItem}><StatSquare icon="assignment" value={String(assignedTasks.length).padStart(2, '0')} label="ASSIGNED TASKS" trend={`+${tasks.length}`} /></motion.div>
                <motion.div variants={staggerItem}><StatSquare icon="check_circle" value="128" label="MISSIONS" /></motion.div>
                <motion.div variants={staggerItem}><StatSquare icon="calendar_month" value="03" label="UPCOMING" tag="Next: 2h" /></motion.div>
              </motion.div>
              <div className="space-y-6">
                <h3 className="font-black text-foreground uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <span className="material-icons text-primary text-lg">view_column</span> Mission Pipeline
                </h3>
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedTasks.map(task => (
                    <motion.div key={task.id} variants={staggerItem}>
                      <TaskCard title={task.title} mission={task.mission || 'Unassigned'} urgency={task.urgency} type={task.urgency === 'HIGH' ? 'danger' : 'active'} />
                    </motion.div>
                  ))}
                  {assignedTasks.length === 0 && (
                    <div className="col-span-2 p-12 text-center text-muted-foreground text-xs font-bold">No assigned tasks</div>
                  )}
                </motion.div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border p-8 shadow-sm">
                  <h3 className="font-black text-foreground uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2"><span className="material-icons text-primary">verified</span> Credentials</h3>
                  <div className="space-y-4">
                    <SkillRow icon="medical_services" title="Field First Aid" level="L3" />
                    <SkillRow icon="local_shipping" title="Terrain Transport" level="ADV" />
                  </div>
               </div>
            </div>
          </motion.div>
        );
      case 'Local Supplies':
        return (
          <motion.div key="vol-supplies" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">On-Site Inventory</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Field Station</p>
              </div>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Request Refill</button>
            </div>
            {suppliesLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-bold">Loading...</div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {localSupplies.map(item => (
                  <motion.div key={item.id} variants={staggerItem} whileHover={{ scale: 1.03, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} className={`bg-card dark:bg-card-dark p-6 rounded-[2.5rem] border ${item.is_critical ? 'border-accent-red shadow-lg shadow-red-500/5' : 'border-border'} shadow-sm`}>
                     <div className="flex justify-between items-start mb-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.is_critical ? 'bg-red-50 text-accent-red' : 'bg-blue-50 text-primary'}`}>
                          <span className="material-icons text-lg">
                            {item.category === 'FOOD' ? 'restaurant' : item.category === 'WATER' ? 'water_drop' : 'medical_services'}
                          </span>
                        </div>
                        {item.is_critical && (
                          <span className="text-[8px] font-black text-primary-foreground bg-accent-red px-1.5 py-0.5 rounded uppercase animate-pulse">Low</span>
                        )}
                     </div>
                     <h4 className="text-xs font-black text-foreground mb-1 uppercase tracking-wider">{item.item_name}</h4>
                     <div className="flex items-baseline gap-1">
                       <span className={`text-2xl font-black ${item.is_critical ? 'text-accent-red' : 'text-foreground'}`}>{item.quantity}</span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.unit}</span>
                     </div>
                     <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${item.is_critical ? 'bg-accent-red' : 'bg-accent-green'}`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (item.quantity / item.min_threshold) * 100)}%` }}
                          transition={{ duration: 0.8 }}
                        />
                     </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      case 'Inbound Logistics':
        return (
          <motion.div key="vol-inbound" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Incoming Resources</h2>
            {shipmentsLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-bold">Loading...</div>
            ) : (
              <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shipment ID</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resource</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantity</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">ETA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {inboundShipments.map(s => (
                          <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/50 transition-colors">
                             <td className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">{s.tracking_id}</td>
                             <td className="px-8 py-6 text-sm font-black text-foreground">{s.resource}</td>
                             <td className="px-8 py-6 text-xs font-bold text-muted-foreground">{s.quantity}</td>
                             <td className="px-8 py-6">
                                <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/20 px-2 py-1 rounded-lg uppercase tracking-widest">{s.status}</span>
                             </td>
                             <td className="px-8 py-6 text-right text-sm font-black text-foreground">{s.eta}</td>
                          </motion.tr>
                        ))}
                        {inboundShipments.length === 0 && (
                          <tr><td colSpan={5} className="px-8 py-12 text-center text-muted-foreground text-xs font-bold">No inbound shipments</td></tr>
                        )}
                      </tbody>
                   </table>
                 </div>
              </div>
            )}
          </motion.div>
        );
      case 'Map View':
        return (
          <motion.div key="vol-map" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
             <div className="h-[600px] w-full bg-muted dark:bg-card-dark rounded-[2.5rem] overflow-hidden relative border border-border shadow-xl">
               <ReliefMap />
               <div className="absolute top-1/2 left-1/3 w-10 h-10 bg-primary rounded-full animate-ping opacity-20"></div>
               <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-primary rounded-full shadow-lg border-4 border-card dark:border-background ring-4 ring-primary/20"></div>
               <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-accent-red rounded-full shadow-md animate-bounce ring-4 ring-accent-red/20"></div>
               <div className="absolute bottom-8 left-8 p-6 bg-card/90 dark:bg-card-dark/90 backdrop-blur-md rounded-3xl shadow-2xl border border-border max-w-xs">
                  <h4 className="font-black text-foreground uppercase text-[10px] tracking-widest">Zone B-7 Status</h4>
                  <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed">Dynamic Relief Map active. Red pin indicates high-priority incident at North Perimeter.</p>
               </div>
             </div>
          </motion.div>
        );
      case 'Settings':
        return (
          <motion.div key="vol-settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 max-w-2xl">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Account Settings</h2>
            <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg">AJ</div>
                  <div>
                    <h4 className="font-black text-xl text-foreground tracking-tight">Alex Johnson</h4>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">VOL-9982</p>
                  </div>
               </div>
               <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Dark Theme</p>
                    </div>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>
               </div>
            </div>
          </motion.div>
        );
      default:
        return <div className="p-20 text-center text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Loading Field Hub...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      <aside className="w-72 bg-card dark:bg-card-dark border-r border-border flex flex-col shrink-0 z-[100]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20"><span className="material-icons">ac_unit</span></div>
          <h1 className="font-black text-xl text-foreground leading-none tracking-tight">GroundZero</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <SidebarLink active={activeSidebar === 'Dashboard'} icon="dashboard" label="Field View" onClick={() => setActiveSidebar('Dashboard')} />
          <SidebarLink active={activeSidebar === 'Map View'} icon="map" label="Interactive Map" onClick={() => setActiveSidebar('Map View')} />
          <SidebarLink active={activeSidebar === 'Local Supplies'} icon="inventory_2" label="Local Supplies" onClick={() => setActiveSidebar('Local Supplies')} />
          <SidebarLink active={activeSidebar === 'Inbound Logistics'} icon="local_shipping" label="Inbound Logic" onClick={() => setActiveSidebar('Inbound Logistics')} />
          <div className="pt-8 pb-2 px-4"><p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">SYSTEM</p></div>
          <SidebarLink active={activeSidebar === 'Settings'} icon="settings" label="Settings" onClick={() => setActiveSidebar('Settings')} />
        </nav>
        <div className="p-6 border-t border-border mt-auto">
           <div className="bg-muted p-4 rounded-3xl flex items-center gap-3 cursor-pointer hover:bg-muted/80 transition-all" onClick={() => setActiveSidebar('Settings')}>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">AJ</div>
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground truncate">Alex Johnson</p>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest truncate">Field Agent</p>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card dark:bg-card-dark border-b border-border flex items-center justify-between px-8 shrink-0 z-50">
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{activeSidebar}</h2>
           <div className="flex items-center gap-6">
            <RoleSwitcher currentRole={UserRole.VOLUNTEER} onRoleChange={onRoleChange} />
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}>
    <span className="material-icons text-[22px] shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

const StatSquare: React.FC<{ icon: string; value: string; label: string; trend?: string; tag?: string }> = ({ icon, value, label, trend, tag }) => (
  <motion.div whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} className="bg-card dark:bg-card-dark p-8 rounded-[2.5rem] border border-border shadow-sm relative group cursor-default">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 text-primary rounded-2xl flex items-center justify-center shadow-sm"><span className="material-icons">{icon}</span></div>
      {trend && <span className="text-[9px] font-black text-primary bg-muted px-2 py-1 rounded-lg border border-border uppercase">{trend}</span>}
      {tag && <span className="text-[9px] font-black text-accent-amber bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30 uppercase">{tag}</span>}
    </div>
    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
    <h3 className="text-4xl font-black text-foreground mt-2 tracking-tight">{value}</h3>
  </motion.div>
);

const TaskCard: React.FC<{ title: string; mission: string; urgency: string; type: string }> = ({ title, mission, urgency, type }) => (
  <motion.div whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} className={`bg-card dark:bg-card-dark p-6 rounded-3xl border border-border border-l-4 ${type === 'danger' ? 'border-l-red-500' : type === 'active' ? 'border-l-amber-500 shadow-md ring-2 ring-amber-50 dark:ring-amber-900/5' : 'border-l-blue-500'} shadow-sm space-y-4 cursor-pointer`}>
     <div className="flex justify-between items-start"><span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${type === 'danger' ? 'bg-red-50 dark:bg-red-950/20 text-red-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'}`}>{urgency}</span></div>
     <div><h4 className="font-black text-foreground text-sm leading-tight">{title}</h4><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{mission}</p></div>
  </motion.div>
);

const SkillRow: React.FC<{ icon: string; title: string; level: string }> = ({ icon, title, level }) => (
  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl">
     <div className="flex items-center gap-4"><div className="w-10 h-10 bg-card dark:bg-card-dark rounded-xl flex items-center justify-center text-muted-foreground shadow-sm"><span className="material-icons text-lg">{icon}</span></div><p className="text-sm font-black text-foreground leading-none">{title}</p></div>
     <span className="text-[9px] font-black text-accent-green bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-full uppercase tracking-widest">{level}</span>
  </div>
);

const ReliefMap: React.FC = () => (
  <div className="absolute inset-0 w-full h-full opacity-70 dark:opacity-40 pointer-events-none transition-opacity duration-700">
    <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#grid)" />
      <path d="M 50 450 C 200 400 300 550 500 450 S 750 350 800 500" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30" fill="none" />
      <path d="M 0 350 C 250 300 350 450 550 350 S 800 250 800 400" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30" fill="none" />
      <path d="M 400 0 L 410 200 L 350 400 L 380 600" stroke="currentColor" strokeWidth="2.5" className="text-border" fill="none" />
      <path d="M 0 300 L 200 310 L 410 200 L 600 250 L 800 220" stroke="currentColor" strokeWidth="2.5" className="text-border" fill="none" />
    </svg>
  </div>
);
