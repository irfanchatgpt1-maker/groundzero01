import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';
import { RoleSwitcher } from './RoleSwitcher';
import { useCamps } from '@/hooks/use-camps';
import { useShipments, ShipmentRow, getShipmentProgress } from '@/hooks/use-shipments';
import { useInventory } from '@/hooks/use-inventory';
import { useAuditLogs } from '@/hooks/use-audit-logs';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export const AdminDashboard: React.FC<{ onRoleChange: (role: UserRole) => void }> = ({ onRoleChange }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const { data: camps = [], isLoading: campsLoading } = useCamps();
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments();
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory(null);
  const { data: auditLogs = [] } = useAuditLogs(6);

  const [selectedShipment, setSelectedShipment] = useState<ShipmentRow | null>(null);

  // Auto-select first shipment
  useEffect(() => {
    if (shipments.length > 0 && !selectedShipment) {
      setSelectedShipment(shipments[0]);
    }
  }, [shipments, selectedShipment]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const stats = useMemo(() => ({
    activeCamps: camps.filter(c => c.status === 'OPERATIONAL').length,
    criticalCount: camps.filter(c => c.status === 'CRITICAL').length + inventory.filter(i => i.is_critical).length,
    activeShipments: shipments.filter(s => s.status !== 'ARRIVED' && s.status !== 'DELIVERED').length,
  }), [camps, shipments, inventory]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">System Overview</h2>
                <p className="text-muted-foreground text-sm font-medium">Monitoring real-time operational metrics across all zones.</p>
              </div>
              <div className="flex gap-3">
                <button className="bg-card dark:bg-card-dark border border-border text-muted-foreground px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">file_download</span> Export
                </button>
                <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                  <span className="material-icons text-[18px]">add</span> New Entry
                </button>
              </div>
            </div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={staggerItem}><AdminStatCard icon="holiday_village" value={String(stats.activeCamps)} label="ACTIVE CAMPS" trend="+2%" trendColor="text-accent-green" bgColor="bg-blue-50 dark:bg-blue-900/10" iconColor="text-blue-600 dark:text-blue-400" /></motion.div>
              <motion.div variants={staggerItem}><AdminStatCard icon="volunteer_activism" value="1,204" label="VOLUNTEERS" trend="+15%" trendColor="text-accent-green" bgColor="bg-purple-50 dark:bg-purple-900/10" iconColor="text-purple-600 dark:text-purple-400" /></motion.div>
              <motion.div variants={staggerItem}><AdminStatCard icon="local_shipping" value={String(stats.activeShipments)} label="ACTIVE SHIPMENTS" trend="LIVE" trendColor="text-accent-green" bgColor="bg-slate-50 dark:bg-slate-900/10" iconColor="text-primary" /></motion.div>
              <motion.div variants={staggerItem}><AdminStatCard icon="priority_high" value={String(stats.criticalCount)} label="CRITICAL" trend="Urgent" trendColor="text-accent-red" bgColor="bg-red-50 dark:bg-red-900/10" iconColor="text-accent-red" isUrgent /></motion.div>
            </motion.div>

            <div className="bg-card dark:bg-card-dark rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase text-[10px] tracking-widest">Recent Activity Log</h3>
                <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <tbody className="divide-y divide-border">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-5 text-xs font-black text-foreground">#{log.entity_id.slice(0, 12)}</td>
                        <td className="px-6 py-5 text-xs font-bold text-muted-foreground">{log.entity_type}</td>
                        <td className="px-6 py-5"><span className="text-xs font-bold text-foreground/80">{log.action}</span></td>
                        <td className="px-6 py-5 text-xs font-black text-foreground">{log.details?.slice(0, 50)}</td>
                        <td className="px-6 py-5 text-right"><button className="text-[10px] font-black text-primary uppercase hover:underline tracking-widest">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'Global Logistics':
        return (
          <motion.div key="logistics" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Transit Manifest</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">LIVE FLEET</span>
              </div>
              <div className="space-y-3">
                {shipmentsLoading ? (
                  <div className="p-8 text-center text-muted-foreground text-xs font-bold">Loading...</div>
                ) : shipments.map((shipment) => (
                  <motion.button
                    key={shipment.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedShipment(shipment)}
                    className={`w-full text-left p-5 rounded-3xl border transition-all ${
                      selectedShipment?.id === shipment.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-lg' 
                        : 'border-border bg-card dark:bg-card-dark hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{shipment.tracking_id}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                        shipment.status === 'ARRIVED' || shipment.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>{shipment.status}</span>
                    </div>
                    <h4 className="font-black text-foreground text-sm">{shipment.resource}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">To: {shipment.destination}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-muted-foreground font-bold">{shipment.quantity}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <span className="material-icons text-xs">schedule</span> ETA: {shipment.eta}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <AnimatePresence mode="wait">
                {selectedShipment ? (
                  <motion.div key={selectedShipment.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border shadow-xl overflow-hidden sticky top-24">
                    <div className="p-8 border-b border-border bg-muted/50">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Shipment Tracking</p>
                          <h2 className="text-3xl font-black text-foreground mt-1">{selectedShipment.tracking_id}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Location</p>
                          <p className="text-lg font-black text-primary uppercase mt-1">{selectedShipment.destination}</p>
                        </div>
                      </div>
                      
                      <div className="relative flex justify-between items-center px-4">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0"></div>
                        <motion.div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0"
                          initial={{ width: '0%' }}
                          animate={{ width: `${getShipmentProgress(selectedShipment.status)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' as const }}
                        />
                        <StepIcon active={true} completed={getShipmentProgress(selectedShipment.status) > 15} icon="shopping_cart" label="Confirmed" />
                        <StepIcon active={getShipmentProgress(selectedShipment.status) >= 50} completed={getShipmentProgress(selectedShipment.status) > 50} icon="warehouse" label="Left HQ" />
                        <StepIcon active={getShipmentProgress(selectedShipment.status) >= 75} completed={getShipmentProgress(selectedShipment.status) === 100} icon="local_shipping" label="On Road" />
                        <StepIcon active={getShipmentProgress(selectedShipment.status) === 100} completed={getShipmentProgress(selectedShipment.status) === 100} icon="home" label="Arrived" />
                      </div>
                    </div>

                    <div className="p-8 space-y-10">
                      <div className="grid grid-cols-2 gap-10">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Dispatcher Detail</p>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                              <span className="material-icons text-2xl">local_shipping</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground">Fleet Unit #{selectedShipment.vehicle_id}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{selectedShipment.weight ? `${selectedShipment.weight} kg` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Priority</p>
                          <span className="px-3 py-1 bg-red-50 text-accent-red text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
                            {selectedShipment.urgency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-border rounded-[3rem]">
                     <span className="material-icons text-5xl text-muted-foreground/30 mb-6">explore</span>
                     <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select an active shipment for HQ Oversight</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 'Camps Management':
        return (
          <motion.div key="camps" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Camps Directory</h2>
            {campsLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-bold">Loading camps...</div>
            ) : (
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {camps.map(camp => (
                  <motion.div key={camp.id} variants={staggerItem} whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} className="bg-card dark:bg-card-dark p-6 rounded-3xl border border-border shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 text-primary rounded-xl flex items-center justify-center">
                        <span className="material-icons">holiday_village</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                        camp.status === 'CRITICAL' ? 'bg-red-50 text-red-600' : camp.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {camp.status}
                      </span>
                    </div>
                    <h4 className="font-black text-foreground">{camp.name}</h4>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{camp.location}</p>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="text-foreground">{Math.round((camp.occupancy/camp.capacity)*100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${camp.occupancy/camp.capacity > 0.9 ? 'bg-accent-red' : 'bg-primary'}`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${(camp.occupancy/camp.capacity)*100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' as const }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium text-right">{camp.occupancy} / {camp.capacity} souls</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        );

      case 'Resource Inventory':
        return (
          <motion.div key="inventory" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Logistics & Supply</h2>
            {inventoryLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-bold">Loading inventory...</div>
            ) : (
              <div className="bg-card dark:bg-card-dark rounded-3xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Item Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Stock Level</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inventory.map(item => (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-muted text-muted-foreground uppercase tracking-widest border border-border">{item.category}</span>
                        </td>
                        <td className="px-6 py-5 text-xs font-black text-foreground">{item.item_name}</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-black ${item.is_critical ? 'text-accent-red animate-pulse' : 'text-foreground'}`}>
                              {item.quantity.toLocaleString()} {item.unit}
                            </span>
                            {item.is_critical && (
                              <span className="text-[8px] font-black uppercase text-accent-red tracking-widest">LOW STOCK ALERT</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Restock</button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        );

      case 'Settings':
        return (
          <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 max-w-2xl">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Preferences</h2>
            <div className="bg-card dark:bg-card-dark rounded-[2rem] border border-border overflow-hidden shadow-sm">
              <div className="p-8 border-b border-border">
                 <h4 className="font-black text-foreground">Interface Customization</h4>
                 <p className="text-xs text-muted-foreground mt-1 font-medium">Adjust your dashboard experience.</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Dark Mode</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">Switch between light and high-contrast black themes.</p>
                    </div>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`w-12 h-6 rounded-full relative transition-all ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-card rounded-full shadow-sm transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <div className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] p-20 text-center bg-card dark:bg-card-dark rounded-3xl border border-dashed border-border">Operational Module Active</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      <aside className="w-72 bg-card dark:bg-card-dark border-r border-border flex flex-col shrink-0 z-[100]">
        <div className="p-8 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <span className="material-icons">waves</span>
          </div>
          <div>
            <h1 className="font-black text-lg text-foreground leading-tight tracking-tight">GroundZero</h1>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">ADMIN HQ</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <SidebarNavItem active={activeTab === 'Dashboard'} icon="dashboard" label="Dashboard" onClick={() => setActiveTab('Dashboard')} />
          <SidebarNavItem active={activeTab === 'Camps Management'} icon="holiday_village" label="Camps" onClick={() => setActiveTab('Camps Management')} />
          <SidebarNavItem active={activeTab === 'Global Logistics'} icon="local_shipping" label="Logistics" onClick={() => setActiveTab('Global Logistics')} />
          <SidebarNavItem active={activeTab === 'Resource Inventory'} icon="inventory_2" label="Inventory" onClick={() => setActiveTab('Resource Inventory')} />
          <div className="pt-8 pb-2 px-4"><p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">PREFERENCES</p></div>
          <SidebarNavItem active={activeTab === 'Settings'} icon="settings" label="Settings" onClick={() => setActiveTab('Settings')} />
        </nav>

        <div className="p-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-black">SJ</div>
            <div className="min-w-0">
              <p className="text-xs font-black text-foreground truncate">Sarah Jenkins</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">System Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card dark:bg-card-dark border-b border-border flex items-center justify-between px-8 shrink-0 z-[150]">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <div className="relative w-full group">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm group-focus-within:text-primary transition-colors">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary text-foreground transition-all placeholder:text-muted-foreground" placeholder="Search systems..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-6 pl-4">
            <RoleSwitcher currentRole={UserRole.ADMIN} onRoleChange={onRoleChange} />
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

const SidebarNavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}>
    <span className="material-icons text-[20px]">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

const StepIcon: React.FC<{ active: boolean; completed: boolean; icon: string; label: string }> = ({ active, completed, icon, label }) => (
  <div className="relative z-10 flex flex-col items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
      completed ? 'bg-primary border-primary text-primary-foreground' : 
      active ? 'bg-card dark:bg-background border-primary text-primary' : 
      'bg-card dark:bg-background border-border text-muted-foreground/40'
    }`}>
      <span className="material-icons text-sm">{completed ? 'check' : icon}</span>
    </div>
    <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
  </div>
);

const AdminStatCard: React.FC<{ icon: string; value: string; label: string; trend: string; trendColor: string; bgColor: string; iconColor: string; isUrgent?: boolean }> = ({ icon, value, label, trend, trendColor, bgColor, iconColor, isUrgent }) => (
  <motion.div variants={cardHover} initial="rest" whileHover="hover" className={`bg-card dark:bg-card-dark p-6 rounded-[2rem] border ${isUrgent ? 'border-red-100 dark:border-red-900/50 ring-4 ring-red-50 dark:ring-red-950/5' : 'border-border'} shadow-sm cursor-default`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 ${bgColor} ${iconColor} rounded-2xl flex items-center justify-center shadow-sm`}>
        <span className="material-icons-round text-2xl">{icon}</span>
      </div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${trendColor} bg-muted border border-border`}>{trend}</span>
    </div>
    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
    <h3 className={`text-3xl font-black mt-1 tracking-tight ${isUrgent ? 'text-accent-red' : 'text-foreground'}`}>{value}</h3>
  </motion.div>
);
