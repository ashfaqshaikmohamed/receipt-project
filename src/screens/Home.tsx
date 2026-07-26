import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ReceiptText, 
  LogOut, 
  History as HistoryIcon, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  AlertCircle,
  Calculator,
  MessageSquare,
  ScanLine,
  Users,
  Send,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBill } from '../BillContext';
import { MOCK_PARSED, MOCK_PEOPLE } from '../utils/mockData';
import MockReceiptModal from '../components/MockReceiptModal';

// ─── Tutorial slides data ────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 0,
    icon: ScanLine,
    accent: '#5b4fff',
    tag: 'Step 1',
    title: 'Scan any receipt',
    body: 'Photograph your bill and our on-device AI extracts every line item and price instantly — no data ever leaves your phone.',
    visual: <ScanSlide />,
  },
  {
    id: 1,
    icon: Users,
    accent: '#7c3aed',
    tag: 'Step 2',
    title: 'Assign in seconds',
    body: 'Tap person avatars to claim items. Shared dishes split cost automatically. Watch everyone\'s total update live.',
    visual: <AssignSlide />,
  },
  {
    id: 2,
    icon: Calculator,
    accent: '#5b4fff',
    tag: 'Step 3',
    title: 'Math done right',
    body: 'Tax is split proportionally to what each person ordered. Tip divides equally. Every cent accounted for.',
    visual: <MathSlide />,
  },
  {
    id: 3,
    icon: Send,
    accent: '#22c55e',
    tag: 'Step 4',
    title: 'One tap to collect',
    body: 'Each person gets an itemized SMS with their total and Venmo / Zelle / Crypto payment links. No chasing.',
    visual: <SendSlide />,
  },
];

// ─── Slide visuals ────────────────────────────────────────────────────────────
function ScanSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Receipt paper */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-[140px] h-[180px] bg-[#fdfdfd] rounded-xl shadow-2xl relative overflow-hidden flex flex-col p-5 gap-3"
      >
        {['w-[100px]', 'w-[70px]', 'w-[90px]', 'w-[80px]', 'w-[60px]'].map((w, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
            className={`h-2 ${w} bg-[#e0e0e0] rounded-full`}
          />
        ))}
        {/* scan beam */}
        <motion.div
          animate={{ y: [0, 155, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.4 }}
          className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#5b4fff] to-transparent shadow-[0_0_12px_#5b4fff]"
        />
        {/* success flash */}
        <motion.div
          animate={{ opacity: [0, 0.35, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6 }}
          className="absolute inset-0 bg-[#22c55e] rounded-xl pointer-events-none"
        />
      </motion.div>

      {/* floating price tags */}
      {[
        { label: '$8.79',  x: '74%', y: '20%', delay: 0.6 },
        { label: '$60.79', x: '70%', y: '48%', delay: 0.9 },
        { label: '$5.45',  x: '72%', y: '72%', delay: 1.1 },
      ].map((tag, i) => (
        <motion.div
          key={i}
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: tag.delay, duration: 0.4 }}
          style={{ position: 'absolute', left: tag.x, top: tag.y }}
          className="bg-[#5b4fff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
        >
          {tag.label}
        </motion.div>
      ))}
    </div>
  );
}

function AssignSlide() {
  const people = [
    { init: 'As', color: '#5b4fff' },
    { init: 'Af', color: '#7c3aed' },
    { init: 'Rj', color: '#0ea5e9' },
  ];
  const items = [
    { name: 'Wagyu Steak', price: '$60.79', owners: [0, 1] },
    { name: 'Aperol Spritz', price: '$5.45', owners: [0] },
    { name: 'Shirley Temple', price: '$6.24', owners: [2] },
  ];
  return (
    <div className="w-full h-full flex flex-col gap-3 px-2 justify-center">
      {/* avatars */}
      <div className="flex gap-3 justify-center mb-1">
        {people.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, delay: 0.1 * i }}
            style={{ background: p.color }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
          >
            {p.init}
          </motion.div>
        ))}
      </div>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25 + i * 0.15 }}
          className="flex items-center justify-between bg-surface/60 rounded-xl px-4 py-3 border border-white/5"
        >
          <div>
            <p className="text-xs text-white font-semibold">{item.name}</p>
            <div className="flex gap-1 mt-1.5">
              {item.owners.map(idx => (
                <div
                  key={idx}
                  style={{ background: people[idx].color }}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[#111118]"
                >
                  {people[idx].init}
                </div>
              ))}
            </div>
          </div>
          <span className="text-accent font-bold text-sm">{item.price}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MathSlide() {
  return (
    <div className="w-full h-full flex flex-col gap-3 px-2 justify-center">
      {[
        { init: 'As', color: '#5b4fff', name: 'Ashad',  total: 38.64, detail: 'Steak ½ · Spritz · Tax share' },
        { init: 'Af', color: '#7c3aed', name: 'Ashfaq', total: 38.64, detail: 'Steak ½ · Tax share' },
        { init: 'Rj', color: '#0ea5e9', name: 'Raj',    total: 11.34, detail: 'Shirley Temple · Tax share' },
      ].map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 * i }}
          className="bg-surface/60 rounded-2xl p-4 border border-white/5"
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-3">
              <div style={{ background: p.color }} className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs">{p.init}</div>
              <span className="font-bold text-sm">{p.name}</span>
            </div>
            <CountingValue value={p.total} delay={0.3 + i * 0.15} />
          </div>
          <p className="text-[10px] text-text-secondary font-medium pl-12">{p.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}

function SendSlide() {
  return (
    <div className="w-full h-full flex flex-col gap-4 px-2 justify-center">
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, delay: 0.1 }}
        className="bg-accent rounded-3xl rounded-tl-sm p-4 max-w-[90%] shadow-xl shadow-accent/20"
      >
        <p className="text-xs text-white font-medium mb-2.5">Hey Ashad 👋 here's your share from dinner!</p>
        <div className="text-[11px] text-white/80 space-y-1.5">
          <div className="flex justify-between"><span>Wagyu Steak (½)</span><span className="font-bold">$30.40</span></div>
          <div className="flex justify-between"><span>Aperol Spritz</span><span className="font-bold">$5.45</span></div>
          <div className="flex justify-between"><span>Tax + Tip share</span><span className="font-bold">$2.79</span></div>
          <div className="h-px w-full bg-white/10 my-1" />
          <div className="flex justify-between font-bold text-white text-[13px]"><span>Total due</span><span>$38.64</span></div>
        </div>
      </motion.div>
      <div className="flex gap-2">
        {['💸 Venmo', '🏦 Zelle', '🔐 Crypto'].map((label, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="bg-surface border border-white/5 rounded-2xl py-2 px-3 text-[11px] font-bold text-accent whitespace-nowrap"
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Counting animation helper ────────────────────────────────────────────────
const CountingValue: React.FC<{ value: number; delay?: number }> = ({ value, delay = 0 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const inc = value / (1200 / 16);
      const timer = setInterval(() => {
        start += inc;
        if (start >= value) { setDisplay(value); clearInterval(timer); }
        else setDisplay(start);
      }, 16);
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return <span className="text-[18px] font-bold font-display text-accent">${display.toFixed(2)}</span>;
};

// ─── Main component ───────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut, loading, authError, setAuthError } = useAuth();
  const { setPeople, setItems } = useBill();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMock, setShowMock] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  // Auto-open tutorial after a brief delay on first visit
  const [tutorialAutoOpened, setTutorialAutoOpened] = useState(false);

  // Launched straight from Home (no Table Setup yet), so also seed the two
  // demo diners — otherwise Assign/Split would have no one to split with.
  const handleUseMock = () => {
    setPeople(MOCK_PEOPLE);
    setItems(MOCK_PARSED.items.map(item => ({
      ...item,
      assignedTo: [],
      comped: false,
    })));
    navigate('/review', { state: { parsed: MOCK_PARSED } });
  };

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // Auto-show tutorial on first load
  useEffect(() => {
    if (!tutorialAutoOpened) {
      const t = setTimeout(() => {
        setShowTutorial(true);
        setTutorialAutoOpened(true);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [tutorialAutoOpened]);

  useEffect(() => {
    if (showTutorial) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentSlide(0);
    }
  }, [showTutorial]);

  const handleNext = () => { if (currentSlide < SLIDES.length - 1) setCurrentSlide(s => s + 1); };
  const handlePrev = () => { if (currentSlide > 0) setCurrentSlide(s => s - 1); };

  return (
    <>
      <div className="custom-cursor hidden md:block" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Small, unobtrusive demo entry point */}
      <motion.button
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMock(true)}
        style={{ top: 'max(1.25rem, env(safe-area-inset-top))' }}
        className="fixed right-5 z-30 flex items-center gap-1.5 bg-surface/60 backdrop-blur-md border border-white/10 text-text-secondary hover:text-accent hover:border-accent/30 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors"
      >
        <Sparkles size={11} />
        Try me
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex flex-col items-center justify-between p-6 bg-background overflow-hidden"
      >
        {/* Noise */}
        <div className="absolute inset-0 noise-overlay z-10" />

        {/* Animated gradient */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, #0d0d18 0%, #0a0a0f 100%)',
              'radial-gradient(circle at 10% 20%, #1a1a35 0%, #0a0a0f 100%)',
              'radial-gradient(circle at 90% 80%, #15152a 0%, #0a0a0f 100%)',
              'radial-gradient(circle at 50% 50%, #0d0d18 0%, #0a0a0f 100%)',
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        />

        {/* Floating rings */}
        <div className="absolute inset-x-0 top-[25%] bottom-[40%] flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[400px] h-[400px] border border-accent/10 rounded-full flex items-center justify-center"
          >
            <div className="w-[300px] h-[300px] border border-accent/5 rounded-full" />
          </motion.div>
        </div>

        {/* Hero */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center mt-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            style={{ animation: 'pulse-glow 4s infinite ease-in-out' }}
            className="w-16 h-16 bg-gradient-to-br from-accent to-accent-soft rounded-2xl flex items-center justify-center mb-10 shadow-glow"
          >
            <ReceiptText size={32} className="text-white" />
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ filter: 'blur(8px)', opacity: 0, y: 10 }}
              animate={{ filter: 'blur(0)', opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="text-6xl font-display leading-[0.9] tracking-tight"
            >
              Split bills.<br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-accent"
              >
                No awkwardness.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-text-secondary text-lg max-w-[280px] mx-auto font-medium"
            >
              The itemized split that actually texts everyone for you.
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            onClick={() => { setCurrentSlide(0); setShowTutorial(true); }}
            className="mt-8 text-accent font-semibold text-sm flex items-center gap-2 hover:brightness-125 active:scale-95 transition-all group"
          >
            <Sparkles size={16} />
            See how it works
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.button>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-20 w-full max-w-sm mb-16 space-y-6">
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute -top-16 left-0 right-0 p-3 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2 text-error text-xs font-medium"
              >
                <AlertCircle size={14} />
                <span className="flex-1">{authError}</span>
                <button onClick={() => setAuthError(null)} className="p-1"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            onClick={() => navigate('/setup')}
            className="w-full h-14 bg-accent text-white font-bold rounded-2xl text-lg flex items-center justify-center relative overflow-hidden group"
          >
            <span className="relative z-10 font-sans">Start New Bill</span>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, delay: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </motion.button>

          <div className="pt-2">
            {!loading && (
              user ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-surface/80 backdrop-blur-md border border-border p-3 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ''} alt="" className="w-9 h-9 rounded-full border border-accent/20" />
                    <span className="text-sm font-semibold text-text-primary truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate('/history')}
                      className="p-2 text-accent flex items-center gap-1 text-xs font-bold hover:bg-accent/10 rounded-xl transition-colors"
                    >
                      <HistoryIcon size={16} />History
                    </button>
                    <button onClick={signOut} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                      <LogOut size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="space-y-3"
                >
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={signInWithGoogle}
                    className="w-full h-12 bg-white text-[#1a1a1a] font-bold rounded-2xl flex items-center justify-center gap-3 shadow-md border-none transition-transform"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </motion.button>
                  {/* Auth help note */}
                  <p className="text-center text-[10px] text-text-secondary/60 leading-relaxed">
                    Sign-in requires your Firebase project to have this domain added under<br />
                    <span className="font-mono text-accent/60">Authentication → Settings → Authorized domains</span>
                  </p>
                </motion.div>
              )
            )}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-text-secondary text-[10px] uppercase font-bold tracking-[0.2em] mt-6"
          >
            No account needed
          </motion.p>
        </div>
      </motion.div>

      {/* ── Tutorial Modal ── */}
      {createPortal(
        <AnimatePresence>
          {showTutorial && (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center md:p-8">
              <motion.div
                key="tut-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTutorial(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />

              <motion.div
                key="tut-sheet"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 240, mass: 0.9 }}
                className="relative w-full md:w-[480px] md:max-w-[480px] bg-[#0e0e16] rounded-t-[40px] md:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                style={{ height: '88vh', maxHeight: '680px' }}
              >
                {/* Drag handle + close */}
                <div className="flex-shrink-0 flex flex-col items-center pt-3 px-6 mb-1">
                  <div className="w-12 h-1 bg-white/10 rounded-full mb-3" />
                  <div className="w-full flex items-center justify-between h-10">
                    <div className="flex items-center gap-2">
                      <ReceiptText size={16} className="text-accent" />
                      <span className="text-sm font-bold text-text-primary">Receipt</span>
                    </div>
                    <button
                      onClick={() => setShowTutorial(false)}
                      className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Slide track */}
                <div className="flex-1 relative overflow-hidden">
                  <motion.div
                    className="flex h-full"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, { offset }) => {
                      if (offset.x < -50 && currentSlide < SLIDES.length - 1) handleNext();
                      if (offset.x > 50 && currentSlide > 0) handlePrev();
                    }}
                    animate={{ x: `-${currentSlide * 100}%` }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  >
                    {SLIDES.map((slide) => {
                      const Icon = slide.icon;
                      return (
                        <div key={slide.id} className="w-full flex-shrink-0 flex flex-col h-full px-6 select-none">
                          {/* Visual area */}
                          <div
                            className="rounded-3xl overflow-hidden relative flex-shrink-0"
                            style={{
                              height: '46%',
                              background: `radial-gradient(ellipse at 50% 0%, ${slide.accent}18 0%, #09090e 70%)`,
                              border: `1px solid ${slide.accent}15`,
                            }}
                          >
                            {/* Corner tag */}
                            <div
                              className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
                              style={{ background: `${slide.accent}22`, color: slide.accent }}
                            >
                              {slide.tag}
                            </div>
                            {/* Icon badge */}
                            <div
                              className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ background: `${slide.accent}20` }}
                            >
                              <Icon size={18} style={{ color: slide.accent }} />
                            </div>
                            {/* Visual content */}
                            <div className="absolute inset-0 pt-14 pb-4">
                              {slide.visual}
                            </div>
                          </div>

                          {/* Text */}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={slide.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.35 }}
                              className="mt-6 flex-1"
                            >
                              <h3 className="text-2xl font-display mb-3" style={{ color: slide.id === 3 ? '#22c55e' : 'inherit' }}>
                                {slide.title}
                              </h3>
                              <p className="text-text-secondary leading-relaxed">{slide.body}</p>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Arrow nav */}
                  <div className="absolute inset-x-0 top-[23%] flex justify-between px-2 pointer-events-none z-30">
                    <div className="pointer-events-auto">
                      {currentSlide > 0 && (
                        <button
                          onClick={handlePrev}
                          className="w-10 h-10 bg-surface/50 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-all"
                        >
                          <ChevronLeft size={22} />
                        </button>
                      )}
                    </div>
                    <div className="pointer-events-auto">
                      {currentSlide < SLIDES.length - 1 && (
                        <button
                          onClick={handleNext}
                          className="w-10 h-10 bg-surface/50 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-all"
                        >
                          <ChevronRight size={22} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: dots + CTA */}
                <div className="flex-shrink-0 px-6 pb-10 pt-2">
                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-2.5 mb-6">
                    {SLIDES.map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        animate={{
                          width: currentSlide === i ? 28 : 8,
                          backgroundColor: currentSlide === i ? '#5b4fff' : '#2a2a3a',
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-2 rounded-full"
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {currentSlide === SLIDES.length - 1 ? (
                      <motion.button
                        key="cta-try"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        onClick={() => setShowTutorial(false)}
                        className="w-full h-14 bg-accent text-white font-bold rounded-2xl text-lg shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
                      >
                        Try it now <ArrowRight size={20} />
                      </motion.button>
                    ) : (
                      <motion.div
                        key="cta-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between"
                      >
                        <button
                          onClick={() => setShowTutorial(false)}
                          className="text-text-secondary text-sm font-semibold hover:text-text-primary transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          onClick={handleNext}
                          className="h-12 px-6 bg-accent text-white font-bold rounded-2xl text-sm shadow-lg shadow-accent/20 flex items-center gap-2"
                        >
                          Next <ArrowRight size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <MockReceiptModal
        open={showMock}
        onClose={() => setShowMock(false)}
        onUse={handleUseMock}
      />
    </>
  );
};

export default Home;
