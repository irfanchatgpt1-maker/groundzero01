import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnection } from '@/lib/connection-mode';
import { syncToCloud, getPendingCount } from '@/lib/sync-queue';
import { toast } from 'sonner';

export const ConnectionStatusBanner: React.FC = () => {
  const { mode, isOnline, forceLan, setForceLan, lanApiBase, setLanApiBase, pendingSyncCount, setPendingSyncCount } = useConnection();
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lanInput, setLanInput] = useState(lanApiBase);

  // Update pending count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingSyncCount(getPendingCount());
    }, 3000);
    return () => clearInterval(interval);
  }, [setPendingSyncCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !forceLan && getPendingCount() > 0) {
      handleSync();
    }
  }, [isOnline, forceLan]);

  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await syncToCloud();
      setPendingSyncCount(getPendingCount());
      if (result.synced > 0) toast.success(`Synced ${result.synced} records to cloud`);
      if (result.conflicts > 0) toast.info(`${result.conflicts} conflicts resolved (last-write-wins)`);
      if (result.errors.length > 0) toast.error(`${result.errors.length} sync errors`);
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [syncing, setPendingSyncCount]);

  const saveLanUrl = () => {
    setLanApiBase(lanInput);
    toast.success('LAN endpoint updated');
    setShowSettings(false);
  };

  const bannerConfig = {
    cloud: {
      bg: 'bg-accent-green/10 border-accent-green/30',
      dot: 'bg-accent-green',
      text: 'text-accent-green',
      label: 'Online — Cloud Mode',
      icon: 'cloud',
    },
    lan: {
      bg: 'bg-accent-amber/10 border-accent-amber/30',
      dot: 'bg-accent-amber animate-pulse',
      text: 'text-accent-amber',
      label: 'Offline — LAN Emergency Mode',
      icon: 'wifi_off',
    },
    'forced-lan': {
      bg: 'bg-blue-500/10 border-blue-500/30',
      dot: 'bg-blue-500',
      text: 'text-blue-500',
      label: 'Forced LAN Mode',
      icon: 'router',
    },
  }[mode];

  return (
    <>
      <div className={`flex items-center justify-between px-4 py-1.5 border-b ${bannerConfig.bg} text-xs font-bold`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${bannerConfig.dot}`} />
          <span className="material-icons text-sm" style={{ color: 'inherit' }}>{bannerConfig.icon}</span>
          <span className={bannerConfig.text}>{bannerConfig.label}</span>
          {pendingSyncCount > 0 && (
            <span className="text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full text-[10px] font-black">
              {pendingSyncCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pendingSyncCount > 0 && isOnline && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="material-icons text-sm">settings</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-card dark:bg-card-dark"
          >
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Force LAN</label>
                <button
                  onClick={() => setForceLan(!forceLan)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${forceLan ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-card rounded-full shadow-sm transition-all ${forceLan ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">LAN IP</label>
                <input
                  type="text"
                  value={lanInput}
                  onChange={e => setLanInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  placeholder="http://192.168.1.100:3001"
                />
                <button
                  onClick={saveLanUrl}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
