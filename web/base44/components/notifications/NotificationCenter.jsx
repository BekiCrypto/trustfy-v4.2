import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  MessageSquare,
  ArrowRightLeft,
  Scale,
  Shield,
  Info,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const typeConfig = {
  trade_match: { icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  message: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  status_change: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  dispute: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  arbitration: { icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  insurance: { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  system: { icon: Info, color: 'text-slate-400', bg: 'bg-slate-500/10' }
};

const priorityConfig = {
  low: { color: 'text-slate-400', badge: 'bg-slate-500/10' },
  medium: { color: 'text-blue-400', badge: 'bg-blue-500/10' },
  high: { color: 'text-amber-400', badge: 'bg-amber-500/10' },
  critical: { color: 'text-red-400', badge: 'bg-red-500/10' }
};

export default function NotificationCenter({ trigger }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_address: user.email }, '-created_date', 50),
    enabled: !!user?.email,
    refetchInterval: 5000 // Refresh every 5 seconds for real-time updates
  });
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter);
  
  const markAsRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  const deleteNotification = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };
  
  const NotificationItem = ({ notification }) => {
    const config = typeConfig[notification.type] || typeConfig.system;
    const priority = priorityConfig[notification.priority] || priorityConfig.medium;
    const Icon = config.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={`group relative p-4 rounded-lg border transition-colors cursor-pointer ${
          notification.is_read 
            ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50' 
            : 'bg-slate-800/80 border-blue-500/30 hover:bg-slate-800'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`font-medium ${notification.is_read ? 'text-slate-300' : 'text-white'}`}>
                {notification.title}
              </h4>
              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-slate-400 mb-2">{notification.message}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {notification.created_date && format(new Date(notification.created_date), "MMM d, HH:mm")}
              </span>
              {notification.priority !== 'medium' && (
                <Badge className={`text-xs ${priority.badge} ${priority.color} border-0`}>
                  {notification.priority}
                </Badge>
              )}
              {notification.link && (
                <ExternalLink className="w-3 h-3 text-slate-500" />
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification.mutate(notification.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </motion.div>
    );
  };
  
  const TriggerButton = trigger || (
    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
      {unreadCount > 0 ? (
        <>
          <BellRing className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        </>
      ) : (
        <Bell className="w-5 h-5" />
      )}
    </Button>
  );
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-slate-900 border-slate-700 p-0">
        <SheetHeader className="p-6 pb-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl text-white">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-blue-400 hover:text-blue-300"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
          
          <Tabs value={filter} onValueChange={setFilter} className="mt-4">
            <TabsList className="bg-slate-800/50 border border-slate-700 w-full">
              <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-slate-700">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 data-[state=active]:bg-slate-700">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="trade_match" className="flex-1 data-[state=active]:bg-slate-700">
                Trades
              </TabsTrigger>
              <TabsTrigger value="message" className="flex-1 data-[state=active]:bg-slate-700">
                Messages
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="text-center py-10 text-slate-500">Loading...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No notifications</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {filter === 'unread' ? "You're all caught up!" : "Check back later"}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}