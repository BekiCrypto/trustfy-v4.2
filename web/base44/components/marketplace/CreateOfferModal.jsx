import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { validateTradeOffer, sanitizeInput } from "@/components/utils/validation";
import ConfirmDialog from "../common/ConfirmDialog";
import { useTranslation } from 'react-i18next';

// BEP20 Tokens (BSC Only - MVP)
const TOKENS = ['USDT', 'USDC', 'BUSD', 'BNB'];
const CHAINS = ['BSC']; // MVP: BSC only
const FIAT_CURRENCIES = [
  // Americas
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$' },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'VES', name: 'Venezuelan Bolivar', symbol: 'Bs' },
  
  // Europe
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  
  // Asia
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  
  // Middle East
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£' },
  
  // Africa
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£E' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT' },
  { code: 'XOF', name: 'West African CFA', symbol: 'CFA' },
  { code: 'XAF', name: 'Central African CFA', symbol: 'FCFA' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
  
  // Oceania
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' }
];

const PAYMENT_METHODS = {
  // Americas
  USD: ['Zelle', 'Venmo', 'PayPal', 'Cash App', 'Apple Pay', 'Google Pay', 'Chime', 'Stripe', 'Bank Transfer'],
  CAD: ['Interac e-Transfer', 'PayPal', 'Wise', 'Bank Transfer'],
  MXN: ['SPEI', 'Mercado Pago', 'PayPal', 'Bank Transfer'],
  BRL: ['PIX', 'Mercado Pago', 'PicPay', 'Nubank', 'Bank Transfer'],
  ARS: ['Mercado Pago', 'Ualá', 'Brubank', 'Bank Transfer'],
  CLP: ['Mercado Pago', 'Bank Transfer'],
  COP: ['Nequi', 'Daviplata', 'PSE', 'Bank Transfer'],
  PEN: ['Yape', 'Plin', 'Bank Transfer'],
  VES: ['Zelle', 'PayPal', 'Reserve', 'Bank Transfer'],
  
  // Europe
  EUR: ['SEPA Instant', 'Revolut', 'Wise', 'N26', 'PayPal', 'Lydia', 'Satispay', 'Bank Transfer'],
  GBP: ['Faster Payments', 'PayPal', 'Revolut', 'Wise', 'Monzo', 'Starling Bank', 'Bank Transfer'],
  CHF: ['Twint', 'Revolut', 'Wise', 'Bank Transfer'],
  NOK: ['Vipps', 'Bank Transfer'],
  SEK: ['Swish', 'Bank Transfer'],
  DKK: ['MobilePay', 'Bank Transfer'],
  PLN: ['BLIK', 'Revolut', 'Wise', 'Bank Transfer'],
  CZK: ['Revolut', 'Wise', 'Bank Transfer'],
  HUF: ['Revolut', 'Wise', 'Bank Transfer'],
  RON: ['Revolut', 'Wise', 'Bank Transfer'],
  TRY: ['Papara', 'Ininal', 'PayCell', 'FAST', 'Bank Transfer'],
  RUB: ['Tinkoff', 'Qiwi', 'YooMoney', 'SBP', 'Bank Transfer'],
  UAH: ['Monobank', 'PrivatBank', 'Bank Transfer'],
  
  // Asia - East & Southeast
  CNY: ['Alipay', 'WeChat Pay', 'UnionPay', 'Bank Transfer'],
  JPY: ['PayPay', 'Line Pay', 'Rakuten Pay', 'Merpay', 'Bank Transfer'],
  KRW: ['KakaoPay', 'Toss', 'Naver Pay', 'Bank Transfer'],
  HKD: ['PayMe', 'FPS', 'Alipay HK', 'WeChat Pay HK', 'Bank Transfer'],
  TWD: ['Line Pay', 'JKO Pay', 'Bank Transfer'],
  SGD: ['PayNow', 'GrabPay', 'PayLah!', 'Bank Transfer'],
  MYR: ['Touch n Go eWallet', 'Grab', 'Boost', 'ShopeePay', 'DuitNow', 'Bank Transfer'],
  IDR: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'Bank Transfer'],
  THB: ['PromptPay', 'TrueMoney Wallet', 'Rabbit LINE Pay', 'ShopeePay', 'Bank Transfer'],
  VND: ['MoMo', 'ZaloPay', 'ViettelPay', 'ShopeePay', 'Bank Transfer'],
  PHP: ['GCash', 'PayMaya', 'Coins.ph', 'InstaPay', 'PESONet', 'Bank Transfer'],
  
  // Asia - South
  INR: ['UPI', 'PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Amazon Pay', 'Mobikwik', 'IMPS', 'Bank Transfer'],
  PKR: ['Easypaisa', 'JazzCash', 'IBFT', 'Bank Transfer'],
  BDT: ['bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
  LKR: ['Frimi', 'eZ Cash', 'Bank Transfer'],
  NPR: ['eSewa', 'Khalti', 'IME Pay', 'Bank Transfer'],
  MMK: ['Wave Money', 'KBZ Pay', 'OK Dollar', 'Bank Transfer'],
  KHR: ['Wing', 'ABA Pay', 'Bank Transfer'],
  LAK: ['BCEL One', 'LDB Trust', 'Bank Transfer'],
  
  // Middle East
  AED: ['Liv', 'PayPal', 'Bank Transfer'],
  SAR: ['STC Pay', 'SADAD', 'Bank Transfer'],
  QAR: ['PayPal', 'Bank Transfer'],
  KWD: ['PayPal', 'Bank Transfer'],
  BHD: ['Benefit Pay', 'Bank Transfer'],
  OMR: ['PayPal', 'Bank Transfer'],
  JOD: ['CliQ', 'Bank Transfer'],
  ILS: ['Bit', 'Pepper', 'PayPal', 'Bank Transfer'],
  LBP: ['Whish Money', 'Bank Transfer'],
  
  // Africa
  ETB: ['Telebirr', 'CBE Birr', 'M-Pesa Ethiopia', 'HelloCash', 'Amole', 'Awash Birr', 'Ebirr', 'Bank Transfer'],
  NGN: ['Opay', 'Palmpay', 'Kuda', 'Chipper Cash', 'Paga', 'Bank Transfer'],
  KES: ['M-Pesa', 'Airtel Money', 'T-Kash', 'Equitel', 'Bank Transfer'],
  ZAR: ['SnapScan', 'Zapper', 'TymeBank', 'Capitec Pay', 'Bank Transfer'],
  GHS: ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money', 'Zeepay', 'Chipper Cash', 'Bank Transfer'],
  UGX: ['MTN Mobile Money', 'Airtel Money', 'M-Pesa Uganda', 'Chipper Cash', 'Bank Transfer'],
  TZS: ['M-Pesa Tanzania', 'Airtel Money', 'Tigo Pesa', 'Halo Pesa', 'Chipper Cash', 'Bank Transfer'],
  RWF: ['MTN Mobile Money', 'Airtel Money', 'Tigo Cash', 'Bank Transfer'],
  EGP: ['Vodafone Cash', 'Orange Money', 'Etisalat Cash', 'Fawry', 'InstaPay', 'Bank Transfer'],
  MAD: ['PayPal', 'Bank Transfer'],
  DZD: ['CIB', 'Baridi Mob', 'Bank Transfer'],
  TND: ['D17', 'Bank Transfer'],
  XOF: ['Orange Money', 'MTN Mobile Money', 'Moov Money', 'Wave', 'Free Money', 'Bank Transfer'],
  XAF: ['Orange Money', 'MTN Mobile Money', 'Express Union', 'YUP', 'Bank Transfer'],
  ZMW: ['MTN Mobile Money', 'Airtel Money', 'Bank Transfer'],
  BWP: ['Orange Money', 'MyZaka', 'Bank Transfer'],
  MUR: ['Juice', 'MauCAS', 'Bank Transfer'],
  SCR: ['PayPal', 'Bank Transfer'],
  AOA: ['Unitel Money', 'Multicaixa', 'Bank Transfer'],
  MZN: ['M-Pesa Mozambique', 'Mkesh', 'Bank Transfer'],
  
  // Oceania
  AUD: ['PayID', 'Osko', 'PayPal', 'BPAY', 'Bank Transfer'],
  NZD: ['PayPal', 'Bank Transfer']
};

export default function CreateOfferModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    offer_type: 'buy',
    token_symbol: 'USDT',
    amount: '',
    price_per_unit: '',
    fiat_currency: 'USD',
    chain: 'BSC',
    min_trade_amount: '',
    max_trade_amount: '',
    expires_in_hours: '24',
    min_reputation: '0',
    kyc_required: false,
    notes: ''
  });
  
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [showCustomPaymentInput, setShowCustomPaymentInput] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const createOffer = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      const offerId = `0xO${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(data.expires_in_hours));
      
      return base44.entities.TradeOffer.create({
        offer_id: offerId,
        creator_address: user.email,
        offer_type: data.offer_type,
        token_symbol: data.token_symbol,
        amount: parseFloat(data.amount),
        price_per_unit: parseFloat(data.price_per_unit),
        fiat_currency: data.fiat_currency,
        total_value: parseFloat(data.amount) * parseFloat(data.price_per_unit),
        chain: data.chain,
        min_trade_amount: data.min_trade_amount ? parseFloat(data.min_trade_amount) : parseFloat(data.amount) * 0.1,
        max_trade_amount: data.max_trade_amount ? parseFloat(data.max_trade_amount) : parseFloat(data.amount),
        expires_at: expiresAt.toISOString(),
        status: 'open',
        filled_amount: 0,
        payment_methods: selectedPaymentMethods.map(method => {
          const details = paymentDetails[method];
          return details ? `${method}: ${details}` : method;
        }),
        requirements: {
          min_reputation: parseInt(data.min_reputation) || 0,
          kyc_required: data.kyc_required || false
        },
        notes: data.notes || '',
        matched_trade_ids: []
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['all-offers'] });
      
      toast.success('Offer published successfully!', {
        id: 'create-offer',
        description: `${data.amount} ${data.token_symbol} ${data.offer_type} order is now live`,
        duration: 5000
      });
      
      onOpenChange(false);
      setFormData({
        offer_type: 'buy',
        token_symbol: 'USDT',
        amount: '',
        price_per_unit: '',
        fiat_currency: 'USD',
        chain: 'BSC',
        min_trade_amount: '',
        max_trade_amount: '',
        expires_in_hours: '24',
        min_reputation: '0',
        kyc_required: false,
        notes: ''
      });
      setSelectedPaymentMethods([]);
      setPaymentDetails({});
      setCustomPaymentMethod('');
      setShowCustomPaymentInput(false);
    },
    onError: (error) => {
      console.error('Offer creation error:', error);
      const errorMsg = error?.message || 'Failed to create offer';
      toast.error(errorMsg, {
        id: 'create-offer',
        description: 'Please check your inputs and try again',
        duration: 5000
      });
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateTradeOffer(formData);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the errors in the form', {
        description: Object.values(validation.errors)[0]
      });
      return;
    }
    
    if (selectedPaymentMethods.length === 0) {
      toast.error('Please select at least one payment method', {
        description: 'Buyers need to know how to send payment'
      });
      return;
    }

    // Validate amounts
    const amount = parseFloat(formData.amount);
    const price = parseFloat(formData.price_per_unit);
    const minTrade = formData.min_trade_amount ? parseFloat(formData.min_trade_amount) : null;
    const maxTrade = formData.max_trade_amount ? parseFloat(formData.max_trade_amount) : null;

    if (minTrade && maxTrade && minTrade > maxTrade) {
      toast.error('Minimum trade cannot exceed maximum trade');
      return;
    }

    if (maxTrade && maxTrade > amount) {
      toast.error('Maximum trade cannot exceed total amount');
      return;
    }
    
    // Clear errors and submit
    setValidationErrors({});
    toast.loading('Publishing offer to marketplace...', { id: 'create-offer' });
    
    createOffer.mutate({
      ...formData,
      notes: sanitizeInput(formData.notes)
    });
  };
  
  const togglePaymentMethod = (method) => {
    if (selectedPaymentMethods.includes(method)) {
      setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
      const newDetails = {...paymentDetails};
      delete newDetails[method];
      setPaymentDetails(newDetails);
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, method]);
    }
  };
  
  const handleAddCustomPayment = () => {
    const trimmed = customPaymentMethod.trim();
    if (!trimmed) {
      toast.error('Please enter a payment method name');
      return;
    }
    
    // Check if already exists (case-insensitive)
    if (selectedPaymentMethods.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('This payment method is already added');
      return;
    }
    
    // Check if it's a standard method for current currency
    if (availablePaymentMethods.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('This is already available in the standard list');
      return;
    }
    
    setSelectedPaymentMethods([...selectedPaymentMethods, trimmed]);
    setCustomPaymentMethod('');
    setShowCustomPaymentInput(false);
    toast.success('Custom payment method added');
  };
  
  const availablePaymentMethods = PAYMENT_METHODS[formData.fiat_currency] || PAYMENT_METHODS.USD;
  
  // Clear invalid payment methods when currency changes
  React.useEffect(() => {
    const validMethods = selectedPaymentMethods.filter(method => {
      // Keep custom methods (not in the standard list) or methods valid for current currency
      return !Object.values(PAYMENT_METHODS).flat().includes(method) || availablePaymentMethods.includes(method);
    });
    
    if (validMethods.length !== selectedPaymentMethods.length) {
      setSelectedPaymentMethods(validMethods);
      // Clean up payment details for removed methods
      const newDetails = {};
      validMethods.forEach(method => {
        if (paymentDetails[method]) {
          newDetails[method] = paymentDetails[method];
        }
      });
      setPaymentDetails(newDetails);
    }
  }, [formData.fiat_currency]);
  
  const totalValue = formData.amount && formData.price_per_unit 
    ? (parseFloat(formData.amount) * parseFloat(formData.price_per_unit)).toLocaleString()
    : '0';
  
  const currencySymbol = FIAT_CURRENCIES.find(c => c.code === formData.fiat_currency)?.symbol || formData.fiat_currency;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {t('createOffer.title')}
          </DialogTitle>
          <p className="text-slate-400 text-sm">{t('createOffer.subtitle')}</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Offer Type - Compact */}
          <div>
            <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.offerType')} *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, offer_type: 'buy'})}
                className={`p-3 rounded-lg border transition-all ${
                  formData.offer_type === 'buy'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-emerald-400">{t('createOffer.buy')}</p>
                    <p className="text-xs text-slate-400">{t('createOffer.getCrypto')}</p>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, offer_type: 'sell'})}
                className={`p-3 rounded-lg border transition-all ${
                  formData.offer_type === 'sell'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">💸</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-red-400">{t('createOffer.sell')}</p>
                    <p className="text-xs text-slate-400">{t('createOffer.getFiat')}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Token & Chain - Compact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.token')} *</Label>
              <Select value={formData.token_symbol} onValueChange={(v) => setFormData({...formData, token_symbol: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {TOKENS.map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.network')} *</Label>
              <div className="h-10 px-3 rounded-md border border-slate-700 bg-slate-800 flex items-center justify-between">
                <span className="text-white text-sm font-medium">BSC</span>
                <span className="text-xs text-emerald-400">● {t('createOffer.live')}</span>
              </div>
            </div>
          </div>
          
          {/* Amount & Price - Compact */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.amount')} ({formData.token_symbol}) *</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className={`bg-slate-800 h-10 pr-16 ${validationErrors.amount ? 'border-red-500' : 'border-slate-700'}`}
                  placeholder="1000"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {formData.token_symbol}
                </div>
              </div>
              {validationErrors.amount && (
                <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.amount}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.currency')} *</Label>
                <Select value={formData.fiat_currency} onValueChange={(v) => setFormData({...formData, fiat_currency: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                    {FIAT_CURRENCIES.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.pricePerUnit')} *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {currencySymbol}
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
                    className={`bg-slate-800 h-10 pl-8 ${validationErrors.price_per_unit ? 'border-red-500' : 'border-slate-700'}`}
                    placeholder="1.00"
                  />
                </div>
                {validationErrors.price_per_unit && (
                  <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.price_per_unit}</p>
                )}
              </div>
            </div>
            
            {totalValue !== '0' && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{t('createOffer.totalValue')}</span>
                  <span className="text-lg font-bold text-blue-400">
                    {currencySymbol} {totalValue}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Limits & Options - Compact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.minTrade')}</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.min_trade_amount}
                onChange={(e) => setFormData({...formData, min_trade_amount: e.target.value})}
                className="bg-slate-800 border-slate-700 h-10"
                placeholder={t('createOffer.autoMin')}
              />
            </div>
            
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.maxTrade')}</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_trade_amount}
                onChange={(e) => setFormData({...formData, max_trade_amount: e.target.value})}
                className="bg-slate-800 border-slate-700 h-10"
                placeholder={t('createOffer.autoMax')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.expiresIn')}</Label>
              <Select value={formData.expires_in_hours} onValueChange={(v) => setFormData({...formData, expires_in_hours: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="0.25">{t('createOffer.minutes15')}</SelectItem>
                  <SelectItem value="0.5">{t('createOffer.minutes30')}</SelectItem>
                  <SelectItem value="1">{t('createOffer.hour1')}</SelectItem>
                  <SelectItem value="6">{t('createOffer.hours6')}</SelectItem>
                  <SelectItem value="24">{t('createOffer.hours24')}</SelectItem>
                  <SelectItem value="72">{t('createOffer.days3')}</SelectItem>
                  <SelectItem value="168">{t('createOffer.days7')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.minReputation')}</Label>
              <Input
                type="number"
                value={formData.min_reputation}
                onChange={(e) => setFormData({...formData, min_reputation: e.target.value})}
                className="bg-slate-800 border-slate-700 h-10"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-slate-300">{t('createOffer.paymentMethods')} *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomPaymentInput(!showCustomPaymentInput)}
                className="text-blue-400 hover:text-blue-300 text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t('createOffer.custom')}
              </Button>
            </div>
            
            {showCustomPaymentInput && (
              <div className="flex gap-2">
                <Input
                  value={customPaymentMethod}
                  onChange={(e) => setCustomPaymentMethod(e.target.value)}
                  placeholder={t('createOffer.enterCustom')}
                  className="bg-slate-800 border-slate-700 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomPayment())}
                />
                <Button
                  type="button"
                  onClick={handleAddCustomPayment}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {t('createOffer.add')}
                </Button>
              </div>
            )}
            
            {availablePaymentMethods.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700 max-h-40 overflow-y-auto">
                {availablePaymentMethods.map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={selectedPaymentMethods.includes(method)}
                      onCheckedChange={() => togglePaymentMethod(method)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={method} className="text-xs text-slate-300 cursor-pointer">
                      {method}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400">Add custom payment method</p>
              </div>
            )}
            
            {selectedPaymentMethods.some(m => !availablePaymentMethods.includes(m)) && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">{t('createOffer.customPaymentMethods')}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPaymentMethods
                    .filter(m => !availablePaymentMethods.includes(m))
                    .map((method) => (
                      <div key={method} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded text-xs text-blue-400">
                        {method}
                        <button
                          type="button"
                          onClick={() => togglePaymentMethod(method)}
                          className="ml-1 hover:text-blue-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Details */}
          {selectedPaymentMethods.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('createOffer.paymentDetails')}</Label>
                <p className="text-xs text-slate-500">{t('createOffer.addAccount')}</p>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {selectedPaymentMethods.map((method) => (
                  <div key={method} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <Label className="text-xs text-slate-400 mb-1 block">{method}</Label>
                    <Input
                      value={paymentDetails[method] || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, [method]: e.target.value})}
                      className="bg-slate-900 border-slate-600 text-sm"
                      placeholder={t('createOffer.accountPlaceholder')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* KYC & Notes - Compact */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
            <Label className="text-sm text-slate-300">{t('createOffer.requireKYC')}</Label>
            <Switch
              checked={formData.kyc_required}
              onCheckedChange={(checked) => setFormData({...formData, kyc_required: checked})}
            />
          </div>
          
          <div>
            <Label className="text-sm text-slate-300 mb-2 block">{t('createOffer.notes')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-slate-800 border-slate-700 min-h-[60px] text-sm"
              placeholder={t('createOffer.termsPlaceholder')}
            />
          </div>
          
          <div className="pt-3 border-t border-slate-700/50">
            <Button
              type="submit"
              disabled={createOffer.isPending}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createOffer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('createOffer.publishing')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createOffer.publishOffer')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}