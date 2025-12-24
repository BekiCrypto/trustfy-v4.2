import React, { useState, useRef, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image, Loader2, Check, CheckCheck, MessageSquare } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { createNotification, NotificationTemplates } from "../notifications/notificationHelpers";
import { useTranslation } from '@/hooks/useTranslation';

export default function TradeChat({ trade, messages, currentUser = '0x...YourWallet' }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, fileUrl = null }) => {
      const msg = await base44.entities.ChatMessage.create({
        trade_id: trade.id,
        sender_address: currentUser,
        content,
        message_type: fileUrl ? 'file' : 'text',
        file_url: fileUrl
      });

      // Notify the other party
      const recipient = trade.seller_address === currentUser 
        ? trade.buyer_address 
        : trade.seller_address;

      const notifData = NotificationTemplates.newMessage(trade.id, currentUser);
      await createNotification({
        userAddress: recipient,
        ...notifData,
        metadata: { trade_id: trade.id, message_id: msg.id }
      });

      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', trade.id] });
      setMessage('');
    },
    onError: () => {
      toast.error(t('trade.tradeChat.toastSendFailed'));
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await sendMessage.mutateAsync({ 
        content: t('trade.tradeChat.sharedFile', { name: file.name }),
        fileUrl: file_url 
      });
      toast.success(t('trade.tradeChat.toastFileUploaded'));
    } catch (error) {
      toast.error(t('trade.tradeChat.toastUploadFailed'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ content: message });
  };

  const formatMessageDate = (date) => {
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return t('trade.tradeChat.yesterdayAt', { time: format(date, 'HH:mm') });
    return format(date, 'MMM d, HH:mm');
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = format(new Date(msg.created_date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-[500px] bg-slate-900/50 rounded-xl border border-slate-700/50">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              {t('trade.tradeChat.title')}
            </h3>
            <p className="text-xs text-slate-400">
              {trade.seller_address === currentUser ? t('trade.tradeChat.buyerLabel') : t('trade.tradeChat.sellerLabel')}: {
                trade.seller_address === currentUser 
                  ? trade.buyer_address.slice(0, 10) 
                  : trade.seller_address.slice(0, 10)
              }...
            </p>
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            {t('trade.tradeChat.online')}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">{t('trade.tradeChat.noMessagesTitle')}</p>
            <p className="text-xs text-slate-600 mt-1">{t('trade.tradeChat.noMessagesSubtitle')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center justify-center my-4">
                  <div className="bg-slate-800/50 px-3 py-1 rounded-full">
                    <p className="text-xs text-slate-400">
                      {isToday(new Date(date)) 
                        ? t('trade.tradeChat.todayLabel') 
                        : isYesterday(new Date(date))
                        ? t('trade.tradeChat.yesterdayLabel')
                        : format(new Date(date), 'MMM d, yyyy')
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {msgs.map((msg) => {
                    const isOwn = msg.sender_address === currentUser;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-2 rounded-2xl ${
                            isOwn 
                              ? 'bg-blue-600 text-white rounded-br-sm' 
                              : 'bg-slate-800 text-white border border-slate-700 rounded-bl-sm'
                          }`}>
                            {msg.message_type === 'file' && msg.file_url && (
                              <a 
                                href={msg.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 mb-1 text-blue-300 hover:text-blue-200 underline"
                              >
                                <Image className="w-4 h-4" />
                                {t('trade.tradeChat.viewAttachment')}
                              </a>
                            )}
                            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-2">
                            <span className="text-xs text-slate-500">
                              {msg.created_date && formatMessageDate(new Date(msg.created_date))}
                            </span>
                            {isOwn && (
                              <span className="text-slate-500">
                                {msg.is_read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-400" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile || sendMessage.isPending}
            className="text-slate-400 hover:text-white flex-shrink-0"
          >
            {uploadingFile ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Image className="w-5 h-5" />
            )}
          </Button>
          
          <Textarea
            placeholder={t('trade.tradeChat.placeholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
            rows={1}
          />
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            size="icon"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">{t('trade.tradeChat.enterHint')}</p>
      </div>
    </div>
  );
}
