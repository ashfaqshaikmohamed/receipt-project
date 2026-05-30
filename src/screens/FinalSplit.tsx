import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Send, Share2, RotateCcw, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { useBill, Person } from '../BillContext';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';

const FinalSplit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { people, items, tax, tipAmount, subtotal, total, paymentProfile, resetBill } = useBill();
  const [notified, setNotified] = useState<string[]>([]);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const calculatePersonTotal = (personId: string) => {
    let personSubtotal = 0;
    const personItems: any[] = [];

    items.forEach(item => {
      if (!item.comped && item.assignedTo.includes(personId)) {
        const share = item.price / item.assignedTo.length;
        personSubtotal += share;
        personItems.push({ ...item, share });
      }
    });

    const taxShare = subtotal > 0 ? (personSubtotal / subtotal) * tax : 0;
    const tipShare = subtotal > 0 ? (personSubtotal / subtotal) * tipAmount : 0;
    const personTotal = Math.round((personSubtotal + taxShare + tipShare) * 100) / 100;

    return {
      subtotal: personSubtotal,
      taxShare: Math.round(taxShare * 100) / 100,
      tipShare: Math.round(tipShare * 100) / 100,
      total: personTotal,
      items: personItems
    };
  };

  const handleSendSMS = (person: Person) => {
    const details = calculatePersonTotal(person.id);
    
    let itemsList = details.items.map(item => {
      const shareText = item.assignedTo.length > 1 ? ` (shared ÷ ${item.assignedTo.length})` : '';
      return `${item.name}${shareText} — $${item.share.toFixed(2)}`;
    }).join('\n');

    const message = `Hey ${person.name} 👋 here's your share from dinner 🧾

What you had:
${itemsList}

Subtotal: $${details.subtotal.toFixed(2)}
Tax share: $${details.taxShare.toFixed(2)}
Tip share: $${details.tipShare.toFixed(2)}
─────────────
Your total: $${details.total.toFixed(2)} → pay to ${paymentProfile.ownerName || 'me'}

How to pay:
💸 Venmo: venmo://paycharge?txn=pay&recipients=${paymentProfile.venmoUsername}&amount=${details.total.toFixed(2)}&note=Dinner
🏦 Zelle: ${paymentProfile.zelleContact}
🔐 Crypto: ${paymentProfile.cryptoWallet}
${paymentProfile.squareMerchantId ? `💳 Card: ask ${paymentProfile.ownerName || 'me'} to open Receipt` : ''}`;

    const encoded = encodeURIComponent(message);
    window.open(`sms:${person.phone}?&body=${encoded}`, '_blank');
    
    if (!notified.includes(person.id)) {
      setNotified([...notified, person.id]);
    }
  };

  const handleShare = async (person: Person) => {
    const details = calculatePersonTotal(person.id);
    const message = `Hey ${person.name} 👋 your share for dinner is $${details.total.toFixed(2)}. Pay to ${paymentProfile.ownerName || 'me'} via Venmo: @${paymentProfile.venmoUsername}`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        if (!notified.includes(person.id)) setNotified([...notified, person.id]);
      } else {
        alert('Sharing not supported on this browser');
      }
    } catch (err) {
      console.log('User cancelled share');
    }
  };

  const handleNewBill = () => {
    if (user) {
      setShowSaveModal(true);
    } else {
      if (confirm('Start a new bill? This will clear the current split.')) {
        resetBill();
        navigate('/');
      }
    }
  };

  const handleSaveSplit = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const receiptData = {
        date: serverTimestamp(),
        total: total,
        restaurant: restaurantName.trim(),
        people: people.map(p => ({
          name: p.name,
          total: calculatePersonTotal(p.id).total
        })),
        items: items.map(item => ({
          name: item.name,
          price: item.price
        }))
      };

      await addDoc(collection(db, 'users', user.uid, 'receipts'), receiptData);
      resetBill();
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/receipts`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipSave = () => {
    resetBill();
    navigate('/');
  };

  const getPersonColor = (color: string) => {
    const map: Record<string, string> = {
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
      teal: 'bg-teal-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      cyan: 'bg-cyan-500',
    };
    return map[color] || 'bg-accent';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="min-h-screen bg-background p-6 pb-24"
      >
        <header className="mb-8 safe-top relative">
          <h2 className="text-4xl font-display text-text-primary tracking-tight">The Split</h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-accent mt-2 font-display tracking-tighter"
          >
            ${total.toFixed(2)} total
          </motion.p>
          
          <div className="flex items-center gap-4 mt-8 bg-surface/40 p-1.5 pl-4 rounded-2xl border border-white/5">
            <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(notified.length / people.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 15, bounce: 0.5 }}
                className="h-full bg-accent shadow-[0_0_20px_rgba(91,79,255,0.6)]"
              />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] whitespace-nowrap pr-2">
              {notified.length} / {people.length} NOTIFIED
            </span>
          </div>
        </header>

        <div className="space-y-4 mb-10">
          {people.map((person) => {
            const details = calculatePersonTotal(person.id);
            const isExpanded = expandedPerson === person.id;
            const isPaid = notified.includes(person.id);

            return (
              <motion.div
                key={person.id}
                layout
                className={`card-gradient rounded-[28px] border border-white/5 overflow-hidden transition-all duration-500 ${isPaid ? 'opacity-80 grayscale-[20%] border-success/30 shadow-none' : 'shadow-xl'}`}
              >
                <div 
                  onClick={() => setExpandedPerson(isExpanded ? null : person.id)}
                  className="p-5 flex items-center justify-between cursor-pointer active:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full ${getPersonColor(person.avatarColor)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {person.name[0]}
                      </div>
                      {isPaid && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="absolute -top-1 -right-1 bg-success text-[#111118] w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-[#111111]"
                        >
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-[17px]">
                        {person.name}
                      </h3>
                      {isPaid && <span className="text-[10px] text-success font-bold uppercase tracking-widest leading-none">Notified</span>}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold font-display text-accent tracking-tighter leading-none">${details.total.toFixed(2)}</span>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                       <ChevronDown size={20} className="text-text-secondary opacity-50" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 overflow-hidden"
                    >
                      <div className="space-y-3 py-5 border-t border-white/5">
                        {details.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[13px] text-text-secondary">
                            <span className="flex-1 truncate pr-6 font-medium">
                              {item.name} {item.assignedTo.length > 1 ? `(÷${item.assignedTo.length})` : ''}
                            </span>
                            <span className="font-bold text-white/70 tracking-tighter">${item.share.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-3 flex justify-between text-[11px] text-text-secondary/60 font-bold uppercase tracking-widest">
                          <span>Tax share</span>
                          <span>${details.taxShare.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-text-secondary/60 font-bold uppercase tracking-widest">
                          <span>Tip share</span>
                          <span>${details.tipShare.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-3">
                        <motion.button
                          onClick={() => handleSendSMS(person)}
                          animate={{ 
                            boxShadow: isPaid ? 'none' : '0 0 20px rgba(91, 79, 255, 0.3)',
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex-1 h-12 bg-accent text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-xl active:scale-95 transition-all"
                        >
                          <Send size={16} /> Send Text
                        </motion.button>
                        <button
                          onClick={() => handleShare(person)}
                          className="w-12 h-12 bg-surface border border-white/5 text-text-secondary rounded-2xl flex items-center justify-center active:scale-95 transition-all group hover:text-text-primary"
                        >
                          <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => {
                            if (notified.includes(person.id)) {
                              setNotified(notified.filter(id => id !== person.id));
                            } else {
                              setNotified([...notified, person.id]);
                            }
                          }}
                          className={`px-5 h-12 border rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                            isPaid ? 'bg-success/10 border-success/30 text-success' : 'bg-surface border-white/5 text-text-secondary'
                          }`}
                        >
                          {isPaid ? 'Paid ✓' : 'Mark Paid'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNewBill}
          className="w-full h-14 text-text-secondary font-bold flex items-center justify-center gap-3 backdrop-blur-md rounded-2xl border border-white/5 hover:text-text-primary transition-all mb-12"
        >
          <RotateCcw size={18} /> 
          <span className="text-sm uppercase tracking-[0.2em]">Start New Bill</span>
        </motion.button>
      </motion.div>

      {/* Sticky Bottom Polish */}
      <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t from-background to-transparent z-10" />

      <AnimatePresence>
        {showSaveModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl z-50 p-6 pb-12 shadow-2xl safe-bottom"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-text-primary Inter">Save this split?</h3>
                  <p className="text-[14px] text-text-secondary mt-1">Sync to your receipt history</p>
                </div>
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 text-text-secondary hover:text-text-primary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Restaurant name (optional)"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full h-[52px] bg-elevated border-none rounded-xl px-4 text-text-primary focus:ring-2 focus:ring-accent outline-none Inter placeholder:text-text-secondary/50"
                  autoFocus
                />

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveSplit}
                    disabled={isSaving}
                    className="w-full h-[52px] bg-accent text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={20} />
                        Save Split
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSkipSave}
                    className="w-full h-[44px] text-[#8888aa] font-semibold flex items-center justify-center active:scale-95 transition-transform"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FinalSplit;
