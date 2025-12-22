import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

export default function TradeRatingModal({ open, onOpenChange, trade, counterpartyProfile }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const submitReview = useMutation({
    mutationFn: async () => {
      if (rating === 0) {
        throw new Error(t('trade.tradeRating.toastSelectRating'));
      }

      const user = await base44.auth.me();
      const isUserSeller = trade.seller_address === user.email;
      
      // Create the review
      await base44.entities.TradeReview.create({
        trade_id: trade.id,
        reviewer_address: user.email,
        reviewed_address: isUserSeller ? trade.buyer_address : trade.seller_address,
        rating,
        review_text: reviewText,
        review_tags: selectedTags,
        trade_role: isUserSeller ? 'buyer' : 'seller'
      });

      // Update counterparty's reputation using backend function
      await base44.functions.invoke('calculateReputationScore', {
        wallet_address: counterpartyProfile.wallet_address
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success(t('trade.tradeRating.toastThanks'));
      onOpenChange(false);
      setRating(0);
      setReviewText('');
      setSelectedTags([]);
    },
    onError: (error) => {
      toast.error(error?.message || t('trade.tradeRating.toastSubmitFailed'));
    }
  });

  const ratingTags = [
    t('trade.tradeRating.tags.fastResponse'),
    t('trade.tradeRating.tags.reliable'),
    t('trade.tradeRating.tags.goodCommunication'),
    t('trade.tradeRating.tags.professional'),
    t('trade.tradeRating.tags.friendly'),
    t('trade.tradeRating.tags.trustworthy'),
    t('trade.tradeRating.tags.patient'),
    t('trade.tradeRating.tags.clearInstructions')
  ];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{t('trade.tradeRating.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div>
            <p className="text-slate-400 text-sm mb-3">{t('trade.tradeRating.experiencePrompt')}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-slate-300 mt-2">
                {rating === 5 && t('trade.tradeRating.labels.excellent')}
                {rating === 4 && t('trade.tradeRating.labels.great')}
                {rating === 3 && t('trade.tradeRating.labels.good')}
                {rating === 2 && t('trade.tradeRating.labels.poor')}
                {rating === 1 && t('trade.tradeRating.labels.veryPoor')}
              </p>
            )}
          </div>

          {/* Quick Tags */}
          <div>
            <p className="text-slate-400 text-sm mb-3">{t('trade.tradeRating.quickFeedback')}</p>
            <div className="flex flex-wrap gap-2">
              {ratingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <p className="text-slate-400 text-sm mb-2">{t('trade.tradeRating.addComment')}</p>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t('trade.tradeRating.commentPlaceholder')}
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              maxLength={500}
            />
            <p className="text-slate-500 text-xs mt-1">{reviewText.length}/500</p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => submitReview.mutate()}
            disabled={rating === 0 || submitReview.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {submitReview.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('trade.tradeRating.submitting')}
              </>
            ) : (
              t('trade.tradeRating.submit')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
