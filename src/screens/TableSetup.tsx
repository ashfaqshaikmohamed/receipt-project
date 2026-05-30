import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, X, ChevronDown, ChevronUp, DollarSign, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { useBill, AVATAR_COLORS } from '../BillContext';

const TableSetup: React.FC = () => {
  const navigate = useNavigate();
  const { people, setPeople, paymentProfile, setPaymentProfile } = useBill();
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);

  const addPerson = () => {
    const newId = Date.now().toString();
    const colorIndex = people.length % AVATAR_COLORS.length;
    setPeople([...people, {
      id: newId,
      name: '',
      phone: '',
      avatarColor: AVATAR_COLORS[colorIndex]
    }]);
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const updatePerson = (id: string, field: 'name' | 'phone', value: string) => {
    let sanitizedValue = value;
    if (field === 'name') {
      // No numbers or special chars in names
      sanitizedValue = value.replace(/[0-9!@#$%^&*(),.?":{}|<>]/g, '');
    } else if (field === 'phone') {
      // Digits only
      sanitizedValue = value.replace(/\D/g, '');
    }
    setPeople(people.map(p => p.id === id ? { ...p, [field]: sanitizedValue } : p));
  };

  const hasPaymentMethod = paymentProfile.venmoUsername.trim().length > 0 || 
                           paymentProfile.zelleContact.trim().length > 0;

  const canContinue = people.length >= 2 && 
                      people.every(p => p.name.trim().length > 0 && p.phone.trim().length >= 10) &&
                      hasPaymentMethod &&
                      paymentProfile.ownerName.trim().length > 0;

  const avatarColorMap: Record<string, string> = {
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    teal: 'bg-teal-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-6 pb-40"
    >
      <header className="flex items-center justify-between mb-8 safe-top">
        <button onClick={() => navigate('/')} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">Who's at the table?</h2>
        <div className="w-10"></div>
      </header>

      <div className="mb-8">
        <p className="text-text-secondary text-sm mb-6">Add everyone's name and phone number</p>
        
        <div className="space-y-4">
          <AnimatePresence>
            {people.map((person) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="card-gradient rounded-xl border border-border p-4 flex items-center gap-4 overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-full ${avatarColorMap[person.avatarColor]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {person.name ? person.name[0].toUpperCase() : <UserPlus size={20} />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                    className="w-full bg-transparent text-text-primary text-lg font-medium outline-none placeholder:text-text-secondary"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={person.phone}
                    onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                    className="w-full bg-transparent text-text-secondary text-sm outline-none placeholder:text-text-secondary/50"
                  />
                </div>
                
                <button
                  onClick={() => removePerson(person.id)}
                  className="p-2 text-text-secondary hover:text-error transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={addPerson}
            className="w-full h-14 border border-dashed border-accent text-accent font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Add Person
          </motion.button>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="mb-10">
        <button
          onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
          className="w-full flex items-center justify-between text-text-secondary text-sm py-4 border-t border-border"
        >
          <div className="flex items-center gap-2">
            <CreditCard size={16} />
            <span>Your payment details</span>
              {!hasPaymentMethod && (
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse"></span>
              )}
            </div>
            {isPaymentExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isPaymentExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4 pt-2 overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-elevated rounded-lg px-4 h-14 border border-border focus-within:border-accent transition-colors">
                  <Smartphone size={20} className="text-accent" />
                  <input
                    type="text"
                    placeholder="Venmo @username"
                    value={paymentProfile.venmoUsername}
                    onChange={(e) => setPaymentProfile({...paymentProfile, venmoUsername: e.target.value.replace(/\s/g, '')})}
                    className="bg-transparent flex-1 outline-none text-text-primary"
                  />
                </div>
                <div className="flex items-center gap-3 bg-elevated rounded-lg px-4 h-14 border border-border focus-within:border-accent transition-colors">
                  <DollarSign size={20} className="text-[#6739bf]" />
                  <input
                    type="text"
                    placeholder="Zelle phone or email"
                    value={paymentProfile.zelleContact}
                    onChange={(e) => setPaymentProfile({...paymentProfile, zelleContact: e.target.value})}
                    className="bg-transparent flex-1 outline-none text-text-primary"
                  />
                </div>
                <div className="flex items-center gap-3 bg-elevated rounded-lg px-4 h-14 border border-border focus-within:border-accent transition-colors">
                  <Wallet size={20} className="text-warning" />
                  <input
                    type="text"
                    placeholder="Crypto wallet (optional)"
                    value={paymentProfile.cryptoWallet}
                    onChange={(e) => setPaymentProfile({...paymentProfile, cryptoWallet: e.target.value})}
                    className="bg-transparent flex-1 outline-none text-text-primary"
                  />
                </div>
                <div className="flex items-center gap-3 bg-elevated rounded-lg px-4 h-14 border border-border focus-within:border-accent transition-colors">
                  <UserPlus size={20} className="text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Your Full Name (for Zelle)"
                    value={paymentProfile.ownerName}
                    onChange={(e) => setPaymentProfile({...paymentProfile, ownerName: e.target.value.replace(/[0-9]/g, '')})}
                    className="bg-transparent flex-1 outline-none text-text-primary"
                  />
                </div>
              </div>
              {!hasPaymentMethod && (
                <p className="text-error text-xs font-bold uppercase tracking-wider">At least one payment method is required</p>
              )}
              {!paymentProfile.ownerName && (
                <p className="text-warning text-xs">Please enter your name as the bill owner</p>
              )}
            </motion.div>
          )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10">
        <motion.button
          whileTap={canContinue ? { scale: 0.97 } : {}}
          disabled={!canContinue}
          onClick={() => navigate('/capture')}
          className={`w-full h-14 font-semibold rounded-lg text-lg transition-all flex items-center justify-center ${
            canContinue
              ? 'bg-accent text-white shadow-lg shadow-accent/30 ring-2 ring-accent/20'
              : 'bg-elevated text-text-secondary cursor-not-allowed'
          }`}
        >
          Continue
        </motion.button>
        <div className="safe-bottom"></div>
      </div>
    </motion.div>
  );
};

export default TableSetup;
