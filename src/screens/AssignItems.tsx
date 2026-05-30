import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ChevronUp, ChevronDown } from 'lucide-react';
import { useBill } from '../BillContext';

const AssignItems: React.FC = () => {
  const navigate = useNavigate();
  const { items, setItems, people, subtotal } = useBill();
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const assignedCount = items.filter(item => item.assignedTo.length > 0).length;
  const progress = (assignedCount / items.length) * 100;

  const toggleAssignment = (itemId: string, personId: string) => {
    setItems(prevItems => prevItems.map(item => {
      // Explicitly guard against updating other items
      if (item.id !== itemId) return item;
      
      const isAssigned = item.assignedTo.includes(personId);
      const newAssignedTo = isAssigned
        ? item.assignedTo.filter(id => id !== personId)
        : [...item.assignedTo, personId];
      
      return { ...item, assignedTo: newAssignedTo };
    }));
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

  const totals = useMemo(() => {
    return people.map(person => {
      let personSubtotal = 0;
      items.forEach(item => {
        if (!item.comped && item.assignedTo.includes(person.id)) {
          personSubtotal += item.price / item.assignedTo.length;
        }
      });
      return { person, subtotal: personSubtotal };
    });
  }, [people, items]);

  const canContinue = assignedCount === items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-6 pb-64"
    >
      <header className="flex flex-col gap-4 mb-6 safe-top">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/review')} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <h2 className="text-xl font-bold text-text-primary">Who had what?</h2>
          <div className="w-10"></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-text-secondary uppercase tracking-widest">
            <span>Progress</span>
            <span>{assignedCount}/{items.length} assigned</span>
          </div>
          <div className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent"
            />
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`card-gradient rounded-2xl border-l-4 p-5 shadow-lg transition-all duration-300 ${
              item.assignedTo.length > 0 
                ? 'border-l-success border-border bg-success/5' 
                : 'border-l-warning border-border/50 bg-warning/5'
            }`}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="space-y-1">
                <h3 className={`text-lg font-bold leading-tight ${item.comped ? 'line-through text-text-secondary opacity-50' : 'text-text-primary'}`}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-2">
                  {item.comped && (
                    <span className="px-1.5 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded">Comped</span>
                  )}
                  {item.assignedTo.length === 0 && !item.comped && (
                    <span className="text-[10px] text-warning/80 font-bold uppercase tracking-wider">Tap to assign</span>
                  )}
                  {item.assignedTo.length > 1 && (
                    <p className="text-[11px] text-text-secondary font-medium">
                      Split {item.assignedTo.length} ways · <span className="text-accent font-bold">${(item.price / item.assignedTo.length).toFixed(2)} ea</span>
                    </p>
                  )}
                </div>
              </div>
              <p className="font-display text-2xl text-accent tracking-tighter">${item.price.toFixed(2)}</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {people.map((person) => (
                <motion.button
                  key={person.id}
                  whileTap={{ scale: 1.2 }}
                  onClick={() => toggleAssignment(item.id, person.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all shrink-0 ${
                    item.assignedTo.includes(person.id)
                      ? `${getPersonColor(person.avatarColor)} text-white border-transparent shadow-xl ring-2 ring-accent/20`
                      : 'bg-elevated border-border text-text-secondary hover:border-accent/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm ${
                    item.assignedTo.includes(person.id) ? 'bg-white/20' : getPersonColor(person.avatarColor)
                  }`}>
                    {person.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap">{person.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 p-6 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <AnimatePresence>
            {isSummaryExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                className="bg-elevated/80 backdrop-blur-xl rounded-t-3xl border-x border-t border-white/10 p-6 mb-0 overflow-hidden shadow-2xl relative"
              >
                {/* Glow bar */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                
                <div className="flex items-center justify-between mb-6">
                   <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Running Totals</h4>
                   <span className="text-[10px] font-bold text-accent">AUTO-CALCULATED</span>
                </div>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                  {totals.map(({ person, subtotal }) => (
                    <motion.div 
                      key={person.id} 
                      layout
                      className="flex justify-between items-center bg-surface/40 p-3 rounded-2xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getPersonColor(person.avatarColor)} flex items-center justify-center text-[12px] font-bold text-white shadow-lg`}>
                          {person.name[0]}
                        </div>
                        <span className="font-bold text-sm">{person.name}</span>
                      </div>
                      <span className="font-display text-lg text-accent">${subtotal.toFixed(2)}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
            className={`w-full bg-surface/80 backdrop-blur-xl border border-white/10 flex items-center justify-between px-6 h-14 transition-all duration-500 shadow-2xl ${isSummaryExpanded ? 'rounded-b-none border-b-0' : 'rounded-t-3xl'}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-1 px-2 bg-accent/10 rounded-lg">
                 <Users size={14} className="text-accent" />
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em]">Quick Peek</span>
            </div>
            <div className="text-text-primary">
              {isSummaryExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </button>

          <motion.button
            whileTap={canContinue ? { scale: 0.97 } : {}}
            disabled={!canContinue}
            onClick={() => navigate('/final')}
            className={`w-full h-14 font-semibold text-lg transition-all flex items-center justify-center rounded-b-2xl ${
              canContinue
                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                : 'bg-elevated text-text-secondary border-x border-b border-border cursor-not-allowed'
            }`}
          >
            {canContinue ? 'Review Split' : `${items.length - assignedCount} items unassigned`}
          </motion.button>
          <div className="safe-bottom"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default AssignItems;
