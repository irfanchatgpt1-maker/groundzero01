import React, { useState, useEffect } from 'react';
import { UserRole, ResourceRequest } from '../types';
import { RoleSwitcher } from './RoleSwitcher';

const DEMO_ORDERS: ResourceRequest[] = [
  { id: 'TRK-492021', requester: 'Main Stadium', role: 'Camp Manager', resource: 'Emergency Rations', quantity: '2,000 Units', urgency: 'HIGH', status: 'PROCESSING', eta: '2h 15m' },
  { id: 'TRK-492022', requester: 'Main Stadium', role: 'Camp Manager', resource: 'Purified Water', quantity: '5,000 L', urgency: 'MEDIUM', status: 'DISPATCHED', eta: '45m' },
  { id: 'TRK-492023', requester: 'Main Stadium', role: 'Camp Manager', resource: 'Medical Kits', quantity: '50 Kits', urgency: 'HIGH', status: 'DELIVERED', eta: 'Arrived' },
];

export const CampManagerDashboard: React.FC<{ onRoleChange: (role: UserRole) => void }> = ({ onRoleChange }) => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [selectedOrder, setSelectedOrder] = useState<ResourceRequest | null>(DEMO_ORDERS[1]);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeNav) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ManagerStat icon="business" value="42" label="ACTIVE CAMPS" trend="+2" />
              <ManagerStat icon="people" value="12,850" label="OCCUPANCY" trend="+5.2%" />
              <ManagerStat icon="report_problem" value="18" label="RESOURCE GAPS" trend="Critical" isCritical />
              <ManagerStat icon="local_shipping" value="24" label="DELIVERIES" trend="12 Active" trendColor="text-accent-green" />
            </div>
            <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border shadow-sm p-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-foreground">Facility Status Feed</h3>
              <div className="space-y-4">
                 <ActivityItem icon="water_drop" title="Supply Refresh" time="15m ago" desc="Main water tanks at 85% capacity." />
                 <ActivityItem icon="groups" title="Shift Transition" time="1h ago" desc="Volunteer shift B reporting for duty." />
                 <ActivityItem icon="emergency" title="Shortage Alert" time="3h ago" desc="Dormitory A requires additional blankets." />
              </div>
            </div>
          </div>
        );
      case 'Logistics':
        return (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Active Shipments</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 TOTAL</span>
              </div>
              <div className="space-y-3">
                {DEMO_ORDERS.map((order) => (
                  <button 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-5 rounded-3xl border transition-all ${
                      selectedOrder?.id === order.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10' 
                        : 'border-border bg-card dark:bg-card-dark hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{order.id}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>{order.status}</span>
                    </div>
                    <h4 className="font-black text-foreground text-sm">{order.resource}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground font-bold">{order.quantity}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <span className="material-icons text-xs">schedule</span> ETA: {order.eta}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              {selectedOrder ? (
                <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border shadow-xl overflow-hidden sticky top-24">
                  <div className="p-8 border-b border-border bg-muted/50">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tracking Status</p>
                        <h2 className="text-2xl font-black text-foreground mt-1">{selectedOrder.id}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expected Arrival</p>
                        <p className="text-lg font-black text-primary uppercase mt-1">{selectedOrder.eta}</p>
                      </div>
                    </div>
                    
                    <div className="relative flex justify-between items-center mb-4 px-2">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0"></div>
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-1000 ${
                        selectedOrder.status === 'PROCESSING' ? 'w-[15%]' : 
                        selectedOrder.status === 'DISPATCHED' ? 'w-[50%]' : 'w-[100%]'
                      }`}></div>
                      
                      <StepIcon active={true} completed={selectedOrder.status !== 'PROCESSING'} icon="shopping_bag" label="Ordered" />
                      <StepIcon active={selectedOrder.status !== 'PROCESSING'} completed={selectedOrder.status === 'DELIVERED'} icon="inventory_2" label="Processed" />
                      <StepIcon active={selectedOrder.status === 'DISPATCHED' || selectedOrder.status === 'DELIVERED'} completed={selectedOrder.status === 'DELIVERED'} icon="local_shipping" label="In Transit" />
                      <StepIcon active={selectedOrder.status === 'DELIVERED'} completed={selectedOrder.status === 'DELIVERED'} icon="task_alt" label="Delivered" />
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Carrier Details</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <span className="material-icons">account_circle</span>
                          </div>
                          <div>
                            <p className="text-xs font-black text-foreground">Rajesh Kumar</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vehicle ID: DL-8902</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Shipment Weight</p>
                        <p className="text-sm font-black text-foreground">142.5 kg</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">24 Cartons</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shipment Journey</p>
                      <div className="space-y-6 relative ml-4">
                        <div className="absolute left-[-16px] top-2 bottom-2 w-0.5 bg-border"></div>
                        <TimelineItem active title="Out for delivery" time="Today, 10:24 AM" location="Central Hub" />
                        <TimelineItem title="Arrived at distribution center" time="Today, 04:12 AM" location="Regional Warehouse" />
                        <TimelineItem title="Shipment picked up" time="Yesterday, 08:30 PM" location="Base Port A" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-border rounded-[3rem]">
                   <span className="material-icons text-4xl text-muted-foreground/30 mb-4">local_shipping</span>
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select an order to track live</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Camps':
        return (
          <div className="bg-card dark:bg-card-dark rounded-3xl border border-border shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Camp Facility</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Zone</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Load Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <CampRow name="Main Stadium" id="CMP-001" loc="Central" load="92" current="2,300" max="2,500" />
                  <CampRow name="North Hall" id="CMP-012" loc="Suburbs" load="78" current="468" max="600" />
                  <CampRow name="Exhibition Bloc" id="CMP-009" loc="Industrial" load="100" current="4,000" max="4,000" isCritical />
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Facility Hub Settings</h2>
            <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border">
                  <h4 className="font-black text-foreground">Profile & Theme</h4>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Manage theme preferences.</p>
               </div>
               <div className="p-8 space-y-6">
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
          </div>
        );
      default:
        return <div className="text-muted-foreground font-black uppercase text-[10px] tracking-widest p-20 text-center bg-card dark:bg-card-dark rounded-3xl border border-dashed border-border">Module Initializing...</div>;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <nav className="h-16 bg-card dark:bg-card-dark border-b border-border flex items-center px-8 shrink-0 justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20"><span className="material-icons">emergency</span></div>
             <h1 className="font-black text-foreground hidden sm:block tracking-tight">GroundZero</h1>
          </div>
          <div className="flex items-center gap-6 h-16 overflow-x-auto no-scrollbar">
            <NavTab label="Dashboard" active={activeNav === 'Dashboard'} onClick={() => setActiveNav('Dashboard')} />
            <NavTab label="Camps" active={activeNav === 'Camps'} onClick={() => setActiveNav('Camps')} />
            <NavTab label="Logistics" active={activeNav === 'Logistics'} onClick={() => setActiveNav('Logistics')} />
            <NavTab label="Settings" active={activeNav === 'Settings'} onClick={() => setActiveNav('Settings')} />
          </div>
        </div>
        <div className="flex items-center gap-4">
           <RoleSwitcher currentRole={UserRole.CAMP_MANAGER} onRoleChange={onRoleChange} />
           <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-[10px] text-primary">CM</div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8 max-w-[1400px] w-full mx-auto space-y-8">
        {renderContent()}
      </main>
    </div>
  );
};

const NavTab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`h-16 flex items-center px-1 font-black text-xs uppercase tracking-widest transition-all border-b-2 shrink-0 ${active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
    {label}
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

const TimelineItem: React.FC<{ title: string; time: string; location: string; active?: boolean }> = ({ title, time, location, active }) => (
  <div className="relative group">
    <div className={`absolute left-[-22px] top-1.5 w-3 h-3 rounded-full border-2 bg-card dark:bg-background transition-all ${active ? 'border-primary scale-125' : 'border-border'}`}></div>
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-xs font-black ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">{location}</p>
      </div>
      <p className="text-[9px] font-bold text-muted-foreground">{time}</p>
    </div>
  </div>
);

const ManagerStat: React.FC<{ icon: string; value: string; label: string; trend: string; trendColor?: string; isCritical?: boolean }> = ({ icon, value, label, trend, trendColor = 'text-accent-amber', isCritical }) => (
  <div className="bg-card dark:bg-card-dark p-6 rounded-[2rem] border border-border shadow-sm">
    <div className="flex items-start justify-between mb-6">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCritical ? 'bg-red-50 dark:bg-red-950/10 text-accent-red' : 'bg-blue-50 dark:bg-blue-950/10 text-primary'}`}><span className="material-icons-round">{icon}</span></div>
       <span className={`text-[9px] font-black px-2 py-1 rounded-lg border border-border bg-muted ${isCritical ? 'text-accent-red' : trendColor}`}>{isCritical ? '!' : '↗'} {trend}</span>
    </div>
    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
    <h3 className="text-3xl font-black text-foreground mt-1 tracking-tight">{value}</h3>
  </div>
);

const ActivityItem: React.FC<{ icon: string; title: string; time: string; desc: string }> = ({ icon, title, time, desc }) => (
  <div className="flex gap-4 p-4 hover:bg-muted/50 transition-colors rounded-2xl group border border-transparent">
     <div className="w-10 h-10 bg-muted text-muted-foreground rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors"><span className="material-icons text-lg">{icon}</span></div>
     <div className="flex-1">
        <div className="flex justify-between items-center"><p className="font-bold text-foreground text-sm">{title}</p><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{time}</span></div>
        <p className="text-xs text-muted-foreground font-medium mt-1">{desc}</p>
     </div>
  </div>
);

const CampRow: React.FC<{ name: string; id: string; loc: string; load: string; current: string; max: string; isCritical?: boolean }> = ({ name, id, loc, load, current, max }) => (
  <tr className="hover:bg-muted/50 transition-colors">
    <td className="px-8 py-6"><p className="text-sm font-black text-foreground">{name}</p><p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">{id}</p></td>
    <td className="px-8 py-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">{loc}</td>
    <td className="px-8 py-6 w-64">
       <div className="flex justify-between text-[10px] font-black mb-1 uppercase tracking-widest"><span className={parseInt(load) > 90 ? 'text-accent-red' : 'text-primary'}>{load}% Load</span><span className="text-muted-foreground">{current}/{max}</span></div>
       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className={`h-full ${parseInt(load) > 90 ? 'bg-accent-red' : 'bg-primary'}`} style={{ width: `${load}%` }}></div></div>
    </td>
    <td className="px-8 py-6 text-right"><button className="px-4 py-1.5 border border-border rounded-xl text-primary text-[10px] font-black uppercase tracking-widest hover:bg-muted">Manage</button></td>
  </tr>
);
