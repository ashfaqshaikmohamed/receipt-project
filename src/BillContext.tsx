import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Person {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[];
  comped: boolean;
}

export interface PaymentProfile {
  venmoUsername: string;
  zelleContact: string;
  cryptoWallet: string;
  squareMerchantId: string;
  ownerName: string;
}

interface BillContextType {
  people: Person[];
  items: Item[];
  tax: number;
  tipPercentage: number;
  tipAmount: number;
  subtotal: number;
  total: number;
  paymentProfile: PaymentProfile;
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setTax: React.Dispatch<React.SetStateAction<number>>;
  setTipPercentage: React.Dispatch<React.SetStateAction<number>>;
  setTipAmount: React.Dispatch<React.SetStateAction<number>>;
  setPaymentProfile: React.Dispatch<React.SetStateAction<PaymentProfile>>;
  resetBill: () => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

const AVATAR_COLORS = ['indigo', 'violet', 'teal', 'amber', 'rose', 'cyan'];

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(20);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paymentProfile, setPaymentProfile] = useState<PaymentProfile>(() => {
    const saved = localStorage.getItem('receipt_payment_profile');
    return saved ? JSON.parse(saved) : {
      venmoUsername: '',
      zelleContact: '',
      cryptoWallet: '',
      squareMerchantId: '',
      ownerName: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('receipt_payment_profile', JSON.stringify(paymentProfile));
  }, [paymentProfile]);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('receipt_payment_profile');
      if (saved) setPaymentProfile(JSON.parse(saved));
    };
    window.addEventListener('paymentProfileUpdated', handleSync);
    return () => window.removeEventListener('paymentProfileUpdated', handleSync);
  }, []);

  const subtotal = items.reduce((acc, item) => acc + (item.comped ? 0 : item.price * (item.quantity || 1)), 0);
  const total = subtotal + tax + tipAmount;

  const resetBill = () => {
    setPeople([]);
    setItems([]);
    setTax(0);
    setTipPercentage(20);
    setTipAmount(0);
  };

  return (
    <BillContext.Provider value={{
      people, items, tax, tipPercentage, tipAmount, subtotal, total, paymentProfile,
      setPeople, setItems, setTax, setTipPercentage, setTipAmount, setPaymentProfile,
      resetBill
    }}>
      {children}
    </BillContext.Provider>
  );
};

export const useBill = () => {
  const context = useContext(BillContext);
  if (!context) throw new Error('useBill must be used within a BillProvider');
  return context;
};

export { AVATAR_COLORS };
