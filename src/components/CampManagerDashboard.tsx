import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';
import { RoleSwitcher } from './RoleSwitcher';
import { useCamps } from '@/hooks/use-camps';
import { useShipments, ShipmentRow, getShipmentProgress } from '@/hooks/use-shipments';
import { ExportDropdown } from './ExportDropdown';
import { NewEntryDialog } from './NewEntryDialog';

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

export const CampManagerDashboard: React.FC<{ onRoleChange: (role: UserRole) => void }> = ({ onRoleChange }) => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: camps = [], isLoading: campsLoading } = useCamps();
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments({ destination: 'Main Stadium' });
  const [selectedOrder, setSelectedOrder] = useState<ShipmentRow | null>(null);

  useEffect(() => {
    if (shipments.length > 0 && !selectedOrder) setSelectedOrder(shipments[0]);
  }, [shipments, selectedOrder]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const getExportData = (): Record<string, unknown>[] => {
    switch (activeNav) {
      case 'Camps': return camps.map(c => ({ Name: c.name, Location: c.location, Status: c.status, Occupancy: c.occupancy, Capacity: c.capacity }));
      case 'Logistics': return shipments.map(s => ({ TrackingID: s.tracking_id, Resource: s.resource, Origin: s.origin, Destination: s.destination, Status: s.status, Quantity: s.quantity }));
      default: return camps.map(c => ({ Name: c.name, Status: c.status, Location: c.location, Occupancy: c.occupancy }));
    }
  };

  const getDefaultEntryType = () => {
    if (activeNav === 'Camps') return 'camp' as const;
    if (activeNav === 'Logistics') return 'shipment' as const;
    return 'camp' as const;
  };

  const navItems = ['Dashboard', 'Camps', 'Logistics', 'Settings'];

  const renderContent = () => {
    switch (activeNav) {
      case 'Dashboard':
        return (
          <motion.div key="cm-dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Camp Overview</h2>
              <div className="flex gap-2 sm:gap-3">
                <ExportDropdown data={getExportData()} filename="groundzero-camp-overview" />
                <button onClick={() => setNewEntryOpen(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                  <span className="material-icons text-[18px]">add</span> <span className="hidden sm:inline">New Entry</span>
                </button>
              </div>
            </div>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <motion.div variants={staggerItem}><ManagerStat icon="business" value={String(camps.length)} label="ACTIVE CAMPS" trend={`+${camps.filter(c => c.status === 'OPERATIONAL').length}`} /></motion.div>
              <motion.div variants={staggerItem}><ManagerStat icon="people" value={camps.reduce((sum, c) => sum + c.occupancy, 0).toLocaleString()} label="OCCUPANCY" trend="+5.2%" /></motion.div>
              <motion.div variants={staggerItem}><ManagerStat icon="report_problem" value={String(camps.filter(c => c.status === 'CRITICAL').length)} label="RESOURCE GAPS" trend="Critical" isCritical /></motion.div>
              <motion.div variants={staggerItem}><ManagerStat icon="local_shipping" value={String(shipments.length)} label="DELIVERIES" trend={`${shipments.filter(s => s.status !== 'ARRIVED').length} Active`} trendColor="text-accent-green" /></motion.div>
            </motion.div>
            <div className="bg-card dark:bg-card-dark rounded-[2rem] sm:rounded-[2.5rem] border border-border shadow-sm p-5 sm:p-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-foreground">Facility Status Feed</h3>
              <div className="space-y-4">
                 <ActivityItem icon="water_drop" title="Supply Refresh" time="15m ago" desc="Main water tanks at 85% capacity." />
                 <ActivityItem icon="groups" title="Shift Transition" time="1h ago" desc="Volunteer shift B reporting for duty." />
                 <ActivityItem icon="emergency" title="Shortage Alert" time="3h ago" desc="Dormitory A requires additional blankets." />
              </div>
            </div>
          </motion.div>
        );
      case 'Logistics':
        return (
          <motion.div key="cm-logistics" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Active Shipments</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{shipments.length} TOTAL</span>
              </div>
              <div className="space-y-3">
                {shipmentsLoading ? (
                  <div className="p-8 text-center text-muted-foreground text-xs font-bold">Loading...</div>
                ) : shipments.map((order) => (
                  <motion.button
                    key={order.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 sm:p-5 rounded-3xl border transition-all ${
                      selectedOrder?.id === order.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10' 
                        : 'border-border bg-card dark:bg-card-dark hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{order.tracking_id}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                        order.status === 'ARRIVED' || order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>{order.status}</span>
                    </div>
                    <h4 className="font-black text-foreground text-sm">{order.resource}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground font-bold">{order.quantity}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <span className="material-icons text-xs">schedule</span> ETA: {order.eta}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {selectedOrder ? (
                  <motion.div key={selectedOrder.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-card dark:bg-card-dark rounded-[2rem] lg:rounded-[2.5rem] border border-border shadow-xl overflow-hidden lg:sticky lg:top-24">
                    <div className="p-5 sm:p-8 border-b border-border bg-muted/50">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tracking Status</p>
                          <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">{selectedOrder.tracking_id}</h2>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expected Arrival</p>
                          <p className="text-base sm:text-lg font-black text-primary uppercase mt-1">{selectedOrder.eta}</p>
                        </div>
                      </div>
                      
                      <div className="relative flex justify-between items-center mb-4 px-2">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0"></div>
                        <motion.div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0"
                          initial={{ width: '0%' }}
                          animate={{ width: `${getShipmentProgress(selectedOrder.status)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' as const }}
                        />
                        <StepIcon active={true} completed={getShipmentProgress(selectedOrder.status) > 15} icon="shopping_bag" label="Ordered" />
                        <StepIcon active={getShipmentProgress(selectedOrder.status) >= 50} completed={getShipmentProgress(selectedOrder.status) > 50} icon="inventory_2" label="Processed" />
                        <StepIcon active={getShipmentProgress(selectedOrder.status) >= 75} completed={getShipmentProgress(selectedOrder.status) === 100} icon="local_shipping" label="In Transit" />
                        <StepIcon active={getShipmentProgress(selectedOrder.status) === 100} completed={getShipmentProgress(selectedOrder.status) === 100} icon="task_alt" label="Delivered" />
                      </div>
                    </div>

                    <div className="p-5 sm:p-8 space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Carrier Details</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                              <span className="material-icons">account_circle</span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground">Vehicle {selectedOrder.vehicle_id}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{selectedOrder.weight ? `${selectedOrder.weight} kg` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Priority</p>
                          <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase tracking-widest ${
                            selectedOrder.urgency === 'HIGH' ? 'bg-red-50 text-accent-red border-red-100' : 'bg-amber-50 text-accent-amber border-amber-100'
                          }`}>{selectedOrder.urgency}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 sm:p-20 text-center border-2 border-dashed border-border rounded-[2rem] lg:rounded-[3rem]">
                     <span className="material-icons text-4xl text-muted-foreground/30 mb-4">local_shipping</span>
                     <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select an order to track live</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      case 'Camps':
        return (
          <motion.div key="cm-camps" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Camps Directory</h2>
              <div className="flex gap-2 sm:gap-3">
                <ExportDropdown data={camps.map(c => ({ Name: c.name, Location: c.location, Status: c.status, Occupancy: c.occupancy, Capacity: c.capacity }))} filename="groundzero-camps" />
                <button onClick={() => setNewEntryOpen(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                  <span className="material-icons text-[18px]">add</span> <span className="hidden sm:inline">Add Camp</span>
                </button>
              </div>
            </div>
            {campsLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-bold">Loading...</div>
            ) : (
              <div className="bg-card dark:bg-card-dark rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 sm:px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Camp Facility</th>
                        <th className="px-4 sm:px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Zone</th>
                        <th className="px-4 sm:px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Load Status</th>
                        <th className="px-4 sm:px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {camps.map(camp => {
                        const load = Math.round((camp.occupancy / camp.capacity) * 100);
                        const isCritical = load >= 95;
                        return (
                          <tr key={camp.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 sm:px-8 py-4 sm:py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCritical ? 'bg-red-50 text-accent-red' : 'bg-blue-50 text-primary'}`}>
                                  <span className="material-icons text-lg">holiday_village</span>
                                </div>
                                <div>
                                  <p className="text-xs font-black text-foreground">{camp.name}</p>
                                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{camp.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-5 text-xs font-bold text-muted-foreground">{camp.location}</td>
                            <td className="px-4 sm:px-8 py-4 sm:py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-20 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div className={`h-full ${isCritical ? 'bg-accent-red' : 'bg-primary'}`} initial={{ width: 0 }} animate={{ width: `${load}%` }} transition={{ duration: 0.8, ease: 'easeOut' as const }} />
                                </div>
                                <span className={`text-[10px] font-black ${isCritical ? 'text-accent-red' : 'text-foreground'}`}>{load}%</span>
                              </div>
                              <p className="text-[9px] text-muted-foreground font-bold mt-1">{camp.occupancy.toLocaleString()} / {camp.capacity.toLocaleString()}</p>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
                              <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Manage</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        );
      case 'Settings':
        return (
          <motion.div key="cm-settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Facility Hub Settings</h2>
            <div className="bg-card dark:bg-card-dark rounded-[2rem] sm:rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
               <div className="p-6 sm:p-8 border-b border-border">
                  <h4 className="font-black text-foreground">Profile & Theme</h4>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Manage theme preferences.</p>
               </div>
               <div className="p-6 sm:p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Dark Mode</p>
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
        return <div className="text-muted-foreground font-black uppercase text-[10px] tracking-widest p-20 text-center bg-card dark:bg-card-dark rounded-3xl border border-dashed border-border">Module Initializing...</div>;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <nav className="h-14 sm:h-16 bg-card dark:bg-card-dark border-b border-border flex items-center px-4 sm:px-8 shrink-0 justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-4 sm:gap-10">
          <div className="flex items-center gap-3">
             {/* Mobile menu toggle */}
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
               <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
             </button>
             <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20"><span className="material-icons">emergency</span></div>
             <h1 className="font-black text-foreground hidden sm:block tracking-tight">GroundZero</h1>
          </div>
          <div className="hidden sm:flex items-center gap-6 h-16 overflow-x-auto no-scrollbar">
            {navItems.map(item => (
              <NavTab key={item} label={item} active={activeNav === item} onClick={() => setActiveNav(item)} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
           <RoleSwitcher currentRole={UserRole.CAMP_MANAGER} onRoleChange={onRoleChange} />
           <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-[10px] text-primary">CM</div>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden bg-card dark:bg-card-dark border-b border-border overflow-hidden z-[55]"
          >
            <div className="p-2 flex flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item}
                  onClick={() => { setActiveNav(item); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeNav === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <NewEntryDialog
        open={newEntryOpen}
        onClose={() => setNewEntryOpen(false)}
        defaultType={getDefaultEntryType()}
        availableTypes={['camp', 'shipment']}
      />
    </div>
  );
};

const NavTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`h-16 flex items-center px-1 font-black text-xs uppercase tracking-widest transition-all border-b-2 shrink-0 ${active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
    {label}
  </button>
);

const StepIcon: React.FC<{ active: boolean; completed: boolean; icon: string; label: string }> = ({ active, completed, icon, label }) => (
  <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
      completed ? 'bg-primary border-primary text-primary-foreground' : 
      active ? 'bg-card dark:bg-background border-primary text-primary' : 
      'bg-card dark:bg-background border-border text-muted-foreground/40'
    }`}>
      <span className="material-icons text-xs sm:text-sm">{completed ? 'check' : icon}</span>
    </div>
    <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tighter ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
  </div>
);

const ManagerStat: React.FC<{ icon: string; value: string; label: string; trend: string; trendColor?: string; isCritical?: boolean }> = ({ icon, value, label, trend, trendColor = 'text-accent-amber', isCritical }) => (
  <motion.div whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} className="bg-card dark:bg-card-dark p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-border shadow-sm cursor-default">
    <div className="flex items-start justify-between mb-4 sm:mb-6">
       <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${isCritical ? 'bg-red-50 dark:bg-red-950/10 text-accent-red' : 'bg-blue-50 dark:bg-blue-950/10 text-primary'}`}><span className="material-icons-round text-xl sm:text-2xl">{icon}</span></div>
       <span className={`text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-border bg-muted ${isCritical ? 'text-accent-red' : trendColor}`}>{isCritical ? '!' : '↗'} {trend}</span>
    </div>
    <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl sm:text-3xl font-black text-foreground mt-1 tracking-tight">{value}</h3>
  </motion.div>
);

const ActivityItem: React.FC<{ icon: string; title: string; time: string; desc: string }> = ({ icon, title, time, desc }) => (
  <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted/50 transition-colors rounded-2xl group border border-transparent">
     <div className="w-10 h-10 bg-muted text-muted-foreground rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><span className="material-icons text-lg">{icon}</span></div>
     <div className="flex-1 min-w-0">
       <div className="flex justify-between items-start gap-2">
         <p className="text-xs font-black text-foreground truncate">{title}</p>
         <span className="text-[9px] text-muted-foreground font-bold shrink-0">{time}</span>
       </div>
       <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
     </div>
  </div>
);
