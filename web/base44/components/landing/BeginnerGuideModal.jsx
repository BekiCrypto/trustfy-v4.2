
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Shield, Lock, Users, CheckCircle2, AlertTriangle, Wallet, Star, Rocket, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function BeginnerGuideModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue-400" />
            Beginner's Guide to TRUSTFY
          </DialogTitle>
          <p className="text-slate-400 text-sm">Simple explanations that anyone can understand</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* What is Trustfy */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">What is TRUSTFY?</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  TRUSTFY is a tool that helps two people trade digital assets safely. It uses <strong>smart contracts</strong>,
                  which are small programs on the blockchain that hold and release funds automatically.
                </p>
                <p className="text-blue-300 font-medium">
                  No one at TRUSTFY can touch your money. You always stay in control of your wallet.
                </p>
              </div>
            </Card>

            {/* NEW SECTION: Authentication & Access */}
            <h2 className="text-xl font-bold text-white mt-8 mb-4 border-b border-slate-700/50 pb-2">
              <KeyRound className="inline-block w-6 h-6 mr-2 text-blue-400" />
              Authentication & Access
            </h2>

            {/* Option 1: Privacy-First Access */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                Option 1: Privacy-First Access <span className="text-xs text-slate-400 font-normal ml-2">(Recommended for Beginners)</span>
              </h3>
              <p className="text-blue-300 font-medium text-sm mb-4">Start trading in 2 minutes with just your wallet</p>

              <div className="space-y-4 text-slate-300 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-1">What You Need:</h4>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>A Web3 wallet (MetaMask, Trust Wallet, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>That's it!</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">What You DON'T Need:</h4>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5 transform rotate-180" />
                      <span>Email address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5 transform rotate-180" />
                      <span>Phone number</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5 transform rotate-180" />
                      <span>Government ID</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5 transform rotate-180" />
                      <span>Bank account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5 transform rotate-180" />
                      <span>Any personal information</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li><strong>Connect Wallet</strong>: Click "Connect Wallet" and choose your wallet</li>
                    <li><strong>Sign Message</strong>: Sign the authentication message (free, no gas)</li>
                    <li><strong>Start Trading</strong>: Browse offers or create your own ad</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">What You Can Do:</h4>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>Create and accept trade offers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>Lock bonds and trade crypto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>Build reputation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>Chat with trading partners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>File and resolve disputes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>Access all standard platform features</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">Trading Limits:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Standard transactions: $1,000 - $10,000</li>
                    <li>Perfect for casual and regular traders</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Option 2: Prime Access */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-orange-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Option 2: Prime Access <span className="text-xs text-slate-400 font-normal ml-2">(For Power Users)</span>
              </h3>
              <p className="text-amber-300 font-medium text-sm mb-4">Upgrade anytime for advanced features and higher limits</p>

              <div className="space-y-4 text-slate-300 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-1">When to Consider Prime:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You want to trade large volumes ($10K-$1M+)</li>
                    <li>You need priority dispute resolution</li>
                    <li>You want to earn referral bonuses</li>
                    <li>You want account recovery options</li>
                    <li>You need API access for automation</li>
                    <li>You want featured marketplace listings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">What's Required for Prime:</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li><strong>Email</strong> (optional) - For account recovery and notifications</li>
                    <li><strong>2FA</strong> (optional) - Extra security layer</li>
                    <li><strong>Identity Verification</strong> (optional) - Only for highest limits</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">Prime Benefits:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <Rocket className="flex-shrink-0 w-4 h-4 text-purple-400 mt-0.5" />
                      <span><strong>10x-100x higher transaction limits</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="flex-shrink-0 w-4 h-4 text-amber-400 mt-0.5" />
                      <span><strong>Priority dispute handling</strong> (faster resolution)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>Referral bonuses and rewards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="flex-shrink-0 w-4 h-4 text-blue-400 mt-0.5" />
                      <span>Full API access for trading bots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="flex-shrink-0 w-4 h-4 text-green-400 mt-0.5" />
                      <span>Advanced analytics and insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5" />
                      <span>Featured marketplace listings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <HelpCircle className="flex-shrink-0 w-4 h-4 text-cyan-400 mt-0.5" />
                      <span>Premium customer support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Which One Should You Choose? */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Which One Should You Choose?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-400" />
                    Choose Privacy-First If:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You value complete anonymity</li>
                    <li>You trade moderate amounts</li>
                    <li>You don't want to share personal info</li>
                    <li>You're in a privacy-sensitive region</li>
                    <li>You're just getting started</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Choose Prime If:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You're a professional trader</li>
                    <li>You need high transaction volumes</li>
                    <li>You want account recovery features</li>
                    <li>You want to maximize fee discounts</li>
                    <li>You need API access for bots</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Can You Switch Later? */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Can You Switch Later?</h3>
              <p className="text-emerald-400 font-bold text-lg mb-2">Yes! Absolutely.</p>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 ml-4">
                <li>Start with wallet-only, upgrade to Prime anytime</li>
                <li>Prime users can still use wallet-only as backup</li>
                <li>Nothing is permanent or locked in</li>
                <li>You're always in control</li>
              </ul>
            </Card>

            {/* Privacy & Security (for this new section) */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Privacy & Security
              </h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-1">Privacy-First Mode:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Zero personal data collected</li>
                    <li>Complete anonymity maintained</li>
                    <li>No tracking or surveillance</li>
                    <li>Wallet is your only identity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Prime Mode:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Data is encrypted and secured</li>
                    <li>Never shared with third parties</li>
                    <li>Used only for features you opt into</li>
                    <li>Can request deletion anytime</li>
                    <li>Wallet-only option always available</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Common Questions (for this new section) */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                Common Questions
              </h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <div>
                  <p className="font-semibold text-white mb-1">Q: Is email required?</p>
                  <p className="ml-4">A: No! Wallet-only access gives you full functionality. Email is only needed if you want Prime features like account recovery or higher limits.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Q: What if I forget my wallet password?</p>
                  <p className="ml-4">A: Use your wallet's seed phrase to recover it. Trustfy cannot help with wallet recovery since we don't control your keys.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Q: Can I use both modes?</p>
                  <p className="ml-4">A: Yes! You can add email/Prime features but still use wallet-only login as your primary method.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Q: Is my data safe?</p>
                  <p className="ml-4">A: Wallet-only users share no data. Prime users' data is encrypted, never shared, and only used for opted-in features.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Q: Can I remove my email later?</p>
                  <p className="ml-4">A: Yes, you can request data deletion anytime. You'll revert to wallet-only access.</p>
                </div>
              </div>
            </Card>

            {/* Our Recommendation */}
            <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Our Recommendation
              </h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <p className="font-semibold text-white">For Most Users: Start with Privacy-First wallet-only access</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Get familiar with the platform</li>
                  <li>Build some reputation</li>
                  <li>Complete a few trades</li>
                  <li>Decide if you need Prime features later</li>
                </ul>
                <p className="text-emerald-300 font-medium mt-2">You can always upgrade when you're ready!</p>
              </div>
            </Card>

            {/* Ready to Start? */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                Ready to Start?
              </h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Get a wallet (we recommend MetaMask for beginners)</li>
                  <li>Click "Connect Wallet" on Trustfy</li>
                  <li>Sign the authentication message</li>
                  <li>Start trading immediately!</li>
                </ol>
                <p className="text-blue-300 font-medium mt-2">
                  No email. No KYC. No complications.
                </p>
                <p className="text-blue-300 font-medium">Just your wallet and you're in.</p>
              </div>
            </Card>
            {/* END NEW SECTION: Authentication & Access */}


            {/* How Escrow Works */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                How the Escrow Works
              </h3>
              <ol className="space-y-2 text-slate-300 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>The seller locks the cryptocurrency in a smart contract</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>The buyer sends payment and confirms it</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>The seller releases the funds when payment is received</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>If something goes wrong, either person can start a dispute</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                  <span>An arbitrator checks the evidence and makes a final decision</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">6</span>
                  <span>The smart contract carries out the decision automatically</span>
                </li>
              </ol>
            </Card>

            {/* Bond System */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                What is the Bond System?
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Both buyer and seller add a small bond to prove they are serious.</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>If both act honestly, they get the bond back</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>If one side tries to cheat, the bond may be used to cover dispute costs</span>
                  </li>
                </ul>
                <p className="text-purple-300 font-medium mt-2">This protects both sides from scams.</p>
              </div>
            </Card>

            {/* Does Trustfy Hold Money */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Does TRUSTFY Hold My Money?</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-emerald-300 font-bold text-lg">No. Never.</p>
                <p>Your money always stays:</p>
                <ol className="space-y-1 ml-6 list-decimal">
                  <li>In your wallet</li>
                  <li>In a smart contract that releases it only when the trade rules are met</li>
                </ol>
                <p className="text-emerald-300 font-medium mt-2">
                  There is no account balance held by TRUSTFY.
                </p>
              </div>
            </Card>

            {/* Identity */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Do I Need to Give My Identity?</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-blue-300 font-bold text-lg">No.</p>
                <p>
                  You use your wallet to log in. No email or phone number is required unless you choose to add it for extra security.
                </p>
              </div>
            </Card>

            {/* Freeze Account */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Can Someone Freeze My Account?</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-blue-300 font-bold text-lg">No.</p>
                <p>We cannot freeze your wallet or your assets.</p>
              </div>
            </Card>

            {/* Privacy */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Who Can See My Trades?
              </h3>
              <div className="text-slate-300 text-sm">
                <p>
                  All blockchain transactions are public, but TRUSTFY does not track your personal activity.
                  You choose what to share.
                </p>
              </div>
            </Card>

            {/* Risks */}
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Is Trading Risky?
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-red-300 font-medium">
                  All crypto trading carries risk. Prices can change. Wallet mistakes cannot be reversed.
                </p>
                <p className="text-amber-300">Make sure you double-check every step.</p>
              </div>
            </Card>

            {/* Support */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Where Do I Reach Support?</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Support is available through the platform.</p>
                <p className="text-red-300 font-medium">
                  We will never ask for your private keys.
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Still have questions? Check our full documentation or contact support
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
