import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, CheckCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotificationBanner() {
  const [dismissedIds, setDismissedIds] = useState([]);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['banner-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter(
      { user_address: user.email, is_read: false },
      '-created_date',
      3
    ),
    enabled: !!user?.email,
    refetchInterval: 5000
  });

  // Only show high/critical priority unread notifications
  const criticalNotifications = notifications.filter(
    n => (n.priority === 'high' || n.priority === 'critical') && !dismissedIds.includes(n.id)
  );

  const handleDismiss = (id) => {
    setDismissedIds([...dismissedIds, id]);
  };

  const handleClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    handleDismiss(notification.id);
  };

  if (criticalNotifications.length === 0) return null;

  const getIcon = (priority) => {
    if (priority === 'critical') return AlertTriangle;
    if (priority === 'high') return Bell;
    return Info;
  };

  const getColor = (priority) => {
    if (priority === 'critical') return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      iconBg: 'bg-red-500/20'
    };
    if (priority === 'high') return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20'
    };
    return {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20'
    };
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {criticalNotifications.map((notification) => {
          const Icon = getIcon(notification.priority);
          const colors = getColor(notification.priority);

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`${colors.bg} ${colors.border} border backdrop-blur-xl rounded-lg p-4 shadow-xl cursor-pointer`}
              onClick={() => handleClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.iconBg} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-slate-300">
                    {notification.message}
                  </p>
                  {notification.link && (
                    <p className="text-xs text-slate-400 mt-2">
                      Click to view details →
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(notification.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}