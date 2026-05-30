import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { BillProvider } from './BillContext';

// Screens
import Home from './screens/Home';
import TableSetup from './screens/TableSetup';
import ReceiptCapture from './screens/ReceiptCapture';
import ReviewItems from './screens/ReviewItems';
import AssignItems from './screens/AssignItems';
import FinalSplit from './screens/FinalSplit';
import History from './screens/History';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<TableSetup />} />
        <Route path="/capture" element={<ReceiptCapture />} />
        <Route path="/review" element={<ReviewItems />} />
        <Route path="/assign" element={<AssignItems />} />
        <Route path="/final" element={<FinalSplit />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BillProvider>
      <Router>
        <div className="max-w-md mx-auto min-h-screen bg-background relative selection:bg-accent/30 selection:text-accent-soft">
          <AnimatedRoutes />
        </div>
      </Router>
    </BillProvider>
  );
}
