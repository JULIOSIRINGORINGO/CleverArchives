"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MaintenanceBanner = () => {
  const [maintenance, setMaintenance] = useState<{ active: boolean; message: string }>({ 
    active: false, 
    message: "" 
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiService.systemSettings.status();
        setMaintenance({ 
          active: res.maintenance_mode, 
          message: res.maintenance_message 
        });
      } catch (err) {
        console.error("Failed to fetch maintenance status", err);
      }
    };

    checkStatus();
    // Re-check every 1 minute
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!maintenance.active || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-amber-500 text-white overflow-hidden relative"
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-lg">
              <AlertCircle size={16} className="animate-pulse" />
            </div>
            <p className="text-xs font-bold tracking-widest leading-none">
              <span className="opacity-70">Platform Notification:</span> {maintenance.message}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
