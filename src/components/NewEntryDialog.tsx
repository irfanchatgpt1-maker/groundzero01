import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type EntryType = 'camp' | 'shipment' | 'inventory';

interface NewEntryDialogProps {
  open: boolean;
  onClose: () => void;
  defaultType?: EntryType;
  availableTypes?: EntryType[];
}

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const panel = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.15 } },
};

export const NewEntryDialog: React.FC<NewEntryDialogProps> = ({
  open,
  onClose,
  defaultType = 'camp',
  availableTypes = ['camp', 'shipment', 'inventory'],
}) => {
  const [entryType, setEntryType] = useState<EntryType>(defaultType);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Camp fields
  const [campName, setCampName] = useState('');
  const [campLocation, setCampLocation] = useState('');
  const [campCapacity, setCampCapacity] = useState('');
  const [campLead, setCampLead] = useState('');

  // Shipment fields
  const [shipResource, setShipResource] = useState('');
  const [shipOrigin, setShipOrigin] = useState('');
  const [shipDest, setShipDest] = useState('');
  const [shipQty, setShipQty] = useState('');
  const [shipTrackingId, setShipTrackingId] = useState('');
  const [shipUrgency, setShipUrgency] = useState('MEDIUM');

  // Inventory fields
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('');
  const [invQuantity, setInvQuantity] = useState('');
  const [invUnit, setInvUnit] = useState('units');
  const [invThreshold, setInvThreshold] = useState('');

  const resetFields = () => {
    setCampName(''); setCampLocation(''); setCampCapacity(''); setCampLead('');
    setShipResource(''); setShipOrigin(''); setShipDest(''); setShipQty(''); setShipTrackingId(''); setShipUrgency('MEDIUM');
    setInvName(''); setInvCategory(''); setInvQuantity(''); setInvUnit('units'); setInvThreshold('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (entryType === 'camp') {
        if (!campName || !campLocation || !campCapacity) { toast.error('Fill all required fields'); setSubmitting(false); return; }
        const { error } = await supabase.from('camps').insert({
          name: campName,
          location: campLocation,
          capacity: Number(campCapacity),
          lead: campLead || null,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['camps'] });
      } else if (entryType === 'shipment') {
        if (!shipResource || !shipOrigin || !shipDest || !shipQty || !shipTrackingId) { toast.error('Fill all required fields'); setSubmitting(false); return; }
        const { error } = await supabase.from('shipments').insert({
          resource: shipResource,
          origin: shipOrigin,
          destination: shipDest,
          quantity: shipQty,
          tracking_id: shipTrackingId,
          urgency: shipUrgency,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      } else {
        if (!invName || !invCategory || !invQuantity) { toast.error('Fill all required fields'); setSubmitting(false); return; }
        const { error } = await supabase.from('inventory').insert({
          item_name: invName,
          category: invCategory,
          quantity: Number(invQuantity),
          unit: invUnit,
          min_threshold: Number(invThreshold) || 0,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      }

      toast.success('Entry created successfully');
      resetFields();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabels: Record<EntryType, string> = { camp: 'Camp', shipment: 'Shipment', inventory: 'Inventory' };
  const typeIcons: Record<EntryType, string> = { camp: 'holiday_village', shipment: 'local_shipping', inventory: 'inventory_2' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div {...overlay} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div {...panel} className="relative w-full max-w-lg bg-card dark:bg-card-dark rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground">New Entry</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons text-lg">close</span>
              </button>
            </div>

            {availableTypes.length > 1 && (
              <div className="px-6 pt-4 flex gap-2 flex-wrap">
                {availableTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setEntryType(t)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      entryType === t
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="material-icons text-sm">{typeIcons[t]}</span>
                    {typeLabels[t]}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {entryType === 'camp' && (
                <>
                  <Field label="Camp Name *" value={campName} onChange={setCampName} placeholder="e.g. Blue Bay Hub" />
                  <Field label="Location *" value={campLocation} onChange={setCampLocation} placeholder="e.g. Zone Alpha" />
                  <Field label="Capacity *" value={campCapacity} onChange={setCampCapacity} placeholder="e.g. 500" type="number" />
                  <Field label="Lead (optional)" value={campLead} onChange={setCampLead} placeholder="e.g. John Doe" />
                </>
              )}
              {entryType === 'shipment' && (
                <>
                  <Field label="Tracking ID *" value={shipTrackingId} onChange={setShipTrackingId} placeholder="e.g. HQ-SHIP-0001" />
                  <Field label="Resource *" value={shipResource} onChange={setShipResource} placeholder="e.g. Medical Kits" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Origin *" value={shipOrigin} onChange={setShipOrigin} placeholder="HQ Warehouse" />
                    <Field label="Destination *" value={shipDest} onChange={setShipDest} placeholder="Main Stadium" />
                  </div>
                  <Field label="Quantity *" value={shipQty} onChange={setShipQty} placeholder="e.g. 200 units" />
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">Urgency</label>
                    <select
                      value={shipUrgency}
                      onChange={e => setShipUrgency(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </>
              )}
              {entryType === 'inventory' && (
                <>
                  <Field label="Item Name *" value={invName} onChange={setInvName} placeholder="e.g. Water Bottles" />
                  <Field label="Category *" value={invCategory} onChange={setInvCategory} placeholder="e.g. Water & Sanitation" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Quantity *" value={invQuantity} onChange={setInvQuantity} placeholder="e.g. 1000" type="number" />
                    <Field label="Unit" value={invUnit} onChange={setInvUnit} placeholder="e.g. liters" />
                  </div>
                  <Field label="Min Threshold" value={invThreshold} onChange={setInvThreshold} placeholder="e.g. 100" type="number" />
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-border text-muted-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Entry'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
    />
  </div>
);
