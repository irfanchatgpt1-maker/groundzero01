import React, { useState, useEffect } from 'react';
import { UserRole, Camp, Volunteer, InventoryItem, ResourceRequest } from '../types';
import { RoleSwitcher } from './RoleSwitcher';

const DEMO_CAMPS: Camp[] = [
  { id: 'CMP-101', name: 'Blue Bay Hub', location: 'Coastal Zone A', occupancy: 1240, capacity: 1500, status: 'OPERATIONAL', lead: 'Marcus V.' },
  { id: 'CMP-102', name: 'Riverdale Center', location: 'Central Basin', occupancy: 850, capacity: 900, status: 'CRITICAL', lead: 'Sarah L.' },
  { id: 'CMP-103', name: 'Sandy Shelter', location: 'West Dunes', occupancy: 420, capacity: 1200, status: 'OPERATIONAL', lead: 'John D.' },
  { id: 'CMP-104', name: 'Mountain Peak', location: 'Highland Reach', occupancy: 210, capacity: 500, status: 'MAINTENANCE', lead: 'Elena R.' },
];

const DEMO_ORDERS: ResourceRequest[] = [
  { id: 'HQ-SHIP-7721', requester: 'Blue Bay Hub', role: 'Camp Manager', resource: 'Emergency Rations', quantity: '5,000 Packs', urgency: 'HIGH', status: 'DISPATCHED', eta: '1h 20m' },
  { id: 'HQ-SHIP-7725', requester: 'Riverdale Center', role: 'HQ Dispatch', resource: 'Medical Oxygen', quantity: '40 Units', urgency: 'HIGH', status: 'PROCESSING', eta: '3h 15m' },
  { id: 'HQ-SHIP-7690', requester: 'Sandy Shelter', role: 'Logistics HQ', resource: 'Winter Tents', quantity: '100 Units', urgency: 'MEDIUM', status: 'DELIVERED', eta: 'Arrived' },
];

const DEMO_VOLUNTEERS: Volunteer[] = [
  { id: 'VOL-882', name: 'James Wilson', skills: ['Medical L3', 'Logistics'], status: 'ACTIVE', zone: 'Sector 4', hours: 142 },
  { id: 'VOL-891', name: 'Aria Chen', skills: ['Translation', 'First Aid'], status: 'STANDBY', zone: 'Sector 2', hours: 64 },
  { id: 'VOL-902', name: 'Robert Fox', skills: ['SAR', 'Heavy Machinery'], status: 'ACTIVE', zone: 'Coastal Zone', hours: 210 },
  { id: 'VOL-915', name: 'Linda Grey', skills: ['Counseling', 'Admin'], status: 'OFF_DUTY', zone: 'Central Hub', hours: 95 },
];

const DEMO_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', name: 'Emergency Rations', category: 'FOOD', quantity: 4500, unit: 'packs', minThreshold: 1000 },
  { id: 'INV-002', name: 'Purified Water', category: 'WATER', quantity: 12000, unit: 'L', minThreshold: 3000 },
  { id: 'INV-003', name: 'Medical Kits', category: 'MEDICAL', quantity: 120, unit: 'kits', minThreshold: 200 },
  { id: 'INV-004', name: 'Winter Tents', category: 'SHELTER', quantity: 45, unit: 'units', minThreshold: 50 },
  { id: 'INV-005', name: 'Power Generators', category: 'EQUIPMENT', quantity: 12, unit: 'units', minThreshold: 5 },
];

export const AdminDashboard: React.FC<{ onRoleChange: (role: UserRole) => void }> = ({ onRoleChange }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedShipment, setSelectedShipment] = useState<ResourceRequest | null>(DEMO_ORDERS[0]);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatCard icon="holiday_village" value="142" label="ACTIVE CAMPS" trend="+2%" trendColor="text-accent-green" bgColor="bg-blue-50 dark:bg-blue-900/10" iconColor="text-blue-600 dark:text-blue-400" />
              <AdminStatCard icon="volunteer_activism" value="1,204" label="VOLUNTEERS" trend="+15%" trendColor="text-accent-green" bgColor="bg-purple-50 dark:bg-purple-900/10" iconColor="text-purple-600 dark:text-purple-400" />
              <AdminStatCard icon="local_shipping" value="38" label="ACTIVE SHIPMENTS" trend="92% ON TIME" trendColor="text-accent-green" bgColor="bg-slate-50 dark:bg-slate-900/10" iconColor="text-primary" />
              <AdminStatCard icon="priority_high" value="8" label="CRITICAL" trend="Urgent" trendColor="text-accent-red" bgColor="bg-red-50 dark:bg-red-900/10" iconColor="text-accent-red" isUrgent />
            </div>

            <div className="bg-card dark:bg-card-dark rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-black text-foreground uppercase text-[10px] tracking-widest">Recent Activity Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <tbody className="divide-y divide-border">
                    <RequestRow id="#LOG-8902" camp="Blue Bay Hub" type="Water Supply" qty="500L" urgency="HIGH" status="Logged" icon="water_drop" iconColor="text-blue-500" />
                    <RequestRow id="#LOG-8898" camp="Riverdale Center" type="Medical Aid" qty="20 Unit" urgency="MEDIUM" status="Verified" icon="medical_services" iconColor="text-accent-green" />
                    <RequestRow id="#LOG-8895" camp="Sandy Shelter" type="Rations" qty="150 Kg" urgency="NORMAL" status="Complete" icon="restaurant" iconColor="text-accent-amber" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Global Logistics':
        return (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Transit Manifest</h3>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">LIVE FLEET</span>
              </div>
              <div className="space-y-3">
                {DEMO_ORDERS.map((shipment) => (
                  <button 
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className={`w-full text-left p-5 rounded-3xl border transition-all ${
                      selectedShipment?.id === shipment.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10 shadow-lg' 
                        : 'border-border bg-card dark:bg-card-dark hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{shipment.id}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                        shipment.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>{shipment.status}</span>
                    </div>
                    <h4 className="font-black text-foreground text-sm">{shipment.resource}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-widest">To: {shipment.requester}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-muted-foreground font-bold">{shipment.quantity}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <span className="material-icons text-xs">schedule</span> ETA: {shipment.eta}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              {selectedShipment ? (
                <div className="bg-card dark:bg-card-dark rounded-[2.5rem] border border-border shadow-xl overflow-hidden sticky top-24">
                  <div className="p-8 border-b border-border bg-muted/50">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Shipment Tracking</p>
                        <h2 className="text-3xl font-black text-foreground mt-1">{selectedShipment.id}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Location</p>
                        <p className="text-lg font-black text-primary uppercase mt-1">S-Zone Hub B</p>
                      </div>
                    </div>
                    
                    <div className="relative flex justify-between items-center px-4">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0"></div>
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-1000 ${
                        selectedShipment.status === 'PROCESSING' ? 'w-[15%]' : 
                        selectedShipment.status === 'DISPATCHED' ? 'w-[60%]' : 'w-[100%]'
                      }`}></div>
                      
                      <StepIcon active={true} completed={selectedShipment.status !== 'PROCESSING'} icon="shopping_cart" label="Confirmed" />
                      <StepIcon active={selectedShipment.status !== 'PROCESSING'} completed={selectedShipment.status === 'DELIVERED'} icon="warehouse" label="Left HQ" />
                      <StepIcon active={selectedShipment.status === 'DISPATCHED' || selectedShipment.status === 'DELIVERED'} completed={selectedShipment.status === 'DELIVERED'} icon="local_shipping" label="On Road" />
                      <StepIcon active={selectedShipment.status === 'DELIVERED'} completed={selectedShipment.status === 'DELIVERED'} icon="home" label="Arrived" />
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
                            <p className="text-sm font-black text-foreground">Fleet Unit #4492</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Heavy Cargo Class-A</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Priority</p>
                        <span className="px-3 py-1 bg-red-50 text-accent-red text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
                          {selectedShipment.urgency}
                        </span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-3">Manifest: ID-{selectedShipment.id.slice(-4)}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span className="material-icons text-xs">history</span> Full Audit Log
                      </p>
                      <div className="space-y-8 relative ml-4">
                        <div className="absolute left-[-21px] top-2 bottom-2 w-0.5 bg-border"></div>
                        <AdminTimelineItem active title="Shipment nearing destination" time="10:24 AM" desc="Vehicle entered Blue Bay outer perimeter." />
                        <AdminTimelineItem title="In transit via Route 4" time="07:15 AM" desc="Midway hub check-in completed successfully." />
                        <AdminTimelineItem title="Shipment Left Global HQ" time="04:00 AM" desc="Full cargo inspection passed. Dispatched for delivery." />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-border rounded-[3rem]">
                   <span className="material-icons text-5xl text-muted-foreground/30 mb-6">explore</span>
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select an active shipment for HQ Oversight</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Camps Management':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Camps Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_CAMPS.map(camp => (
                <div key={camp.id} className="bg-card dark:bg-card-dark p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 text-primary rounded-xl flex items-center justify-center">
                      <span className="material-icons">holiday_village</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                      camp.status === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
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
                      <div 
                        className={`h-full transition-all duration-1000 ${camp.occupancy/camp.capacity > 0.9 ? 'bg-accent-red' : 'bg-primary'}`} 
                        style={{ width: `${(camp.occupancy/camp.capacity)*100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium text-right">{camp.occupancy} / {camp.capacity} souls</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Volunteer Directory':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Field Force</h2>
            <div className="bg-card dark:bg-card-dark rounded-3xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Volunteer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Skills</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DEMO_VOLUNTEERS.map(v => (
                    <tr key={v.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] uppercase">
                            {v.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-black text-foreground">{v.name}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{v.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {v.skills.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-muted-foreground">{v.zone}</td>
                      <td className="px-6 py-5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                          v.status === 'ACTIVE' ? 'text-accent-green bg-green-50' : 'text-muted-foreground bg-muted'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Resource Inventory':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Logistics & Supply</h2>
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
                  {DEMO_INVENTORY.map(item => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-muted text-muted-foreground uppercase tracking-widest border border-border">{item.category}</span>
                      </td>
                      <td className="px-6 py-5 text-xs font-black text-foreground">{item.name}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-black ${item.quantity < item.minThreshold ? 'text-accent-red animate-pulse' : 'text-foreground'}`}>
                            {item.quantity.toLocaleString()} {item.unit}
                          </span>
                          {item.quantity < item.minThreshold && (
                            <span className="text-[8px] font-black uppercase text-accent-red tracking-widest">LOW STOCK ALERT</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Restock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Settings':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
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
          </div>
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
            <h1 className="font-black text-lg text-foreground leading-tight tracking-tight">ReliefAdmin</h1>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">COORD HQ</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <SidebarNavItem active={activeTab === 'Dashboard'} icon="dashboard" label="Dashboard" onClick={() => setActiveTab('Dashboard')} />
          <SidebarNavItem active={activeTab === 'Camps Management'} icon="holiday_village" label="Camps" onClick={() => setActiveTab('Camps Management')} />
          <SidebarNavItem active={activeTab === 'Global Logistics'} icon="local_shipping" label="Logistics" onClick={() => setActiveTab('Global Logistics')} />
          <SidebarNavItem active={activeTab === 'Volunteer Directory'} icon="groups" label="Volunteers" onClick={() => setActiveTab('Volunteer Directory')} />
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
          {renderContent()}
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

const AdminTimelineItem: React.FC<{ title: string; time: string; desc: string; active?: boolean }> = ({ title, time, desc, active }) => (
  <div className="relative group">
    <div className={`absolute left-[-26px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-card dark:bg-background transition-all ${active ? 'border-primary scale-110 shadow-sm' : 'border-border'}`}></div>
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-xs font-black ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p>
        <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-relaxed">{desc}</p>
      </div>
      <p className="text-[9px] font-black text-muted-foreground/50 uppercase">{time}</p>
    </div>
  </div>
);

const AdminStatCard: React.FC<{ icon: string; value: string; label: string; trend: string; trendColor: string; bgColor: string; iconColor: string; isUrgent?: boolean }> = ({ icon, value, label, trend, trendColor, bgColor, iconColor, isUrgent }) => (
  <div className={`bg-card dark:bg-card-dark p-6 rounded-[2rem] border ${isUrgent ? 'border-red-100 dark:border-red-900/50 ring-4 ring-red-50 dark:ring-red-950/5' : 'border-border'} shadow-sm`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 ${bgColor} ${iconColor} rounded-2xl flex items-center justify-center shadow-sm`}>
        <span className="material-icons-round text-2xl">{icon}</span>
      </div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${trendColor} bg-muted border border-border`}>{trend}</span>
    </div>
    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
    <h3 className={`text-3xl font-black mt-1 tracking-tight ${isUrgent ? 'text-accent-red' : 'text-foreground'}`}>{value}</h3>
  </div>
);

const RequestRow: React.FC<{ id: string; camp: string; type: string; qty: string; urgency: string; status: string; icon: string; iconColor: string }> = ({ id, camp, type, qty, urgency, icon, iconColor }) => (
  <tr className="hover:bg-muted/50 transition-colors">
    <td className="px-6 py-5 text-xs font-black text-foreground">{id}</td>
    <td className="px-6 py-5 text-xs font-bold text-muted-foreground">{camp}</td>
    <td className="px-6 py-5"><div className="flex items-center gap-2"><span className={`material-icons text-sm ${iconColor}`}>{icon}</span><span className="text-xs font-bold text-foreground/80">{type}</span></div></td>
    <td className="px-6 py-5 text-xs font-black text-foreground">{qty}</td>
    <td className="px-6 py-5"><span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${urgency === 'HIGH' ? 'text-accent-red border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20' : 'text-accent-amber border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20'}`}>{urgency}</span></td>
    <td className="px-6 py-5 text-right"><button className="text-[10px] font-black text-primary uppercase hover:underline tracking-widest">View</button></td>
  </tr>
);
