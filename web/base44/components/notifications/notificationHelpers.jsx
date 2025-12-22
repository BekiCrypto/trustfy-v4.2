import { base44 } from "@/api/base44Client";

export async function createNotification({
  userAddress,
  type,
  title,
  message,
  link,
  priority = 'medium',
  metadata = {},
  sendEmail = false
}) {
  try {
    const notification = await base44.entities.Notification.create({
      user_address: userAddress,
      type,
      title,
      message,
      link,
      priority,
      metadata,
      is_read: false,
      email_sent: false
    });
    
    // Send email for critical notifications
    if (sendEmail && (priority === 'high' || priority === 'critical')) {
      try {
        await base44.integrations.Core.SendEmail({
          to: userAddress,
          subject: `[TRUSTFY] ${title}`,
          body: `
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">TRUSTFY</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                  <h2 style="color: #333; margin-top: 0;">${title}</h2>
                  <p style="color: #666; line-height: 1.6;">${message}</p>
                  ${link ? `
                    <a href="${link}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                      View Details
                    </a>
                  ` : ''}
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    You received this notification from TRUSTFY. Manage your notification preferences in your profile settings.
                  </p>
                </div>
              </body>
            </html>
          `
        });
        
        await base44.entities.Notification.update(notification.id, { email_sent: true });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

// Notification templates
export const NotificationTemplates = {
  // Trade notifications
  tradeMatched: (tradeId, amount, token) => ({
    type: 'trade_match',
    title: '🎯 New Trade Match!',
    message: `Your order has been matched! Trade for ${amount} ${token} is ready. Take action now.`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  offerMatched: (offerId, tradeId, amount, token) => ({
    type: 'trade_match',
    title: '✅ Offer Matched!',
    message: `Your ${amount} ${token} offer has been matched! View trade details to proceed.`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'high',
    sendEmail: true
  }),
  
  tradeFunded: (tradeId, amount, token) => ({
    type: 'status_change',
    title: '💰 Escrow Funded',
    message: `Seller has funded the escrow with ${amount} ${token}. You can now proceed with payment.`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  paymentConfirmed: (tradeId) => ({
    type: 'status_change',
    title: '✓ Payment Received',
    message: 'Buyer has confirmed payment. Please verify and release the crypto from escrow.',
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  tradeInProgress: (tradeId) => ({
    type: 'status_change',
    title: '⏳ Payment Confirmed by Buyer',
    message: 'Buyer has marked payment as sent. Waiting for seller to verify and release funds.',
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'high',
    sendEmail: true
  }),
  
  cryptoReleased: (tradeId, amount, token) => ({
    type: 'status_change',
    title: '🚀 Crypto Released!',
    message: `Seller has released ${amount} ${token} from escrow. Trade is completing.`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  tradeCompleted: (tradeId, amount, token) => ({
    type: 'status_change',
    title: '🎉 Trade Completed!',
    message: `Your trade for ${amount} ${token} has been completed successfully. Funds transferred!`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  tradeCancelled: (tradeId) => ({
    type: 'status_change',
    title: '❌ Trade Cancelled',
    message: 'The trade has been cancelled. Funds will be returned to the escrow holder.',
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'high',
    sendEmail: true
  }),
  
  tradeExpiring: (tradeId, hoursLeft) => ({
    type: 'status_change',
    title: '⏰ Trade Expiring Soon',
    message: `Your trade will expire in ${hoursLeft} hours. Complete it or it will be auto-cancelled.`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'high',
    sendEmail: true
  }),
  
  // Message notifications
  newMessage: (tradeId, senderAddress) => ({
    type: 'message',
    title: 'New Message',
    message: `You have a new message in your trade chat from ${senderAddress.slice(0, 10)}...`,
    link: `/TradeDetails?id=${tradeId}`,
    priority: 'low',
    sendEmail: false
  }),
  
  // Dispute notifications
  disputeOpened: (disputeId, tradeId, initiator) => ({
    type: 'dispute',
    title: '⚠️ Trade Dispute Initiated',
    message: `A dispute has been opened for your trade by ${initiator}. The case is under automated review.`,
    link: `/DisputeDetails?id=${disputeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  disputeResolved: (disputeId, ruling) => ({
    type: 'arbitration',
    title: '✓ Dispute Resolved',
    message: `The dispute has been resolved. Ruling: ${ruling.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}. Check details for fund distribution.`,
    link: `/DisputeDetails?id=${disputeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  disputeEscalated: (disputeId, level) => ({
    type: 'dispute',
    title: '🔼 Dispute Escalated',
    message: `Your dispute has been escalated to ${level === 2 ? 'Human Arbitration' : 'DAO Governance'} for review.`,
    link: `/DisputeDetails?id=${disputeId}`,
    priority: 'high',
    sendEmail: true
  }),
  
  disputeReviewStarted: (disputeId) => ({
    type: 'dispute',
    title: '🔍 Dispute Under Review',
    message: 'An arbitrator has been assigned to your case and is reviewing the evidence.',
    link: `/DisputeDetails?id=${disputeId}`,
    priority: 'high',
    sendEmail: true
  }),
  
  disputeEvidenceRequested: (disputeId) => ({
    type: 'dispute',
    title: '📎 Evidence Required',
    message: 'Additional evidence has been requested for your dispute. Please submit within 48 hours.',
    link: `/DisputeDetails?id=${disputeId}`,
    priority: 'critical',
    sendEmail: true
  }),
  
  // Insurance notifications
  insuranceClaim: (claimId, amount) => ({
    type: 'insurance',
    title: 'Insurance Claim Filed',
    message: `An insurance claim for $${amount} has been filed and is under review.`,
    link: `/InsuranceMarketplace`,
    priority: 'high',
    sendEmail: true
  }),
  
  claimApproved: (claimId, payoutAmount) => ({
    type: 'insurance',
    title: 'Claim Approved! 🎉',
    message: `Your insurance claim has been approved. Payout: $${payoutAmount}`,
    link: `/InsuranceMarketplace`,
    priority: 'critical',
    sendEmail: true
  })
};