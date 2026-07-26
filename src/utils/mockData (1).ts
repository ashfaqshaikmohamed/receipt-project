import type { Person } from '../BillContext';

// Hard-coded parsed data from receipt_example.png so it works reliably on desktop
// (the OCR is skipped for the mock; we parse the known receipt image contents)
export const MOCK_PARSED = {
  restaurant: '590 George St, New Brunswick',
  items: [
    { id: 'mock-1', name: 'Truffle Pizza',   price: 8.79,  quantity: 1 },
    { id: 'mock-2', name: 'Wagyu Steak',     price: 60.79, quantity: 1 },
    { id: 'mock-3', name: 'Aperol Spritz',   price: 5.45,  quantity: 1 },
    { id: 'mock-4', name: 'Shirley Temple',  price: 6.24,  quantity: 1 },
  ],
  subtotal: 81.27,
  tax: 5.69,
  tip: 15.00,
  total: 101.96,
};

// Demo diners used when the mock receipt is launched straight from Home
// (skipping Table Setup), so Assign/Split have people to work with right away.
export const MOCK_PEOPLE: Person[] = [
  { id: 'mock-person-1', name: 'Jane Doe', phone: '1234567890', avatarColor: 'indigo' },
  { id: 'mock-person-2', name: 'John Doe', phone: '1234560987', avatarColor: 'violet' },
];
