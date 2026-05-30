export interface ParsedBill {
  items: { name: string; price: number; id: string; quantity: number }[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export function parseReceipt(text: string): ParsedBill {
  const lines = text.split('\n');
  const items: { name: string; price: number; id: string; quantity: number }[] = [];
  let subtotal = 0;
  let tax = 0;
  let tip = 0;
  let total = 0;

  const priceRegex = /\$?([\d]+\.[\d]{2})/;

  const excludeKeywords = [
    'subtotal', 'sub total', 'sub-total', 'tax', 'balance', 'due', 'amount', 'change',
    'cash', 'visa', 'master', 'amex', 'credit', 'debit', 'payment', 'tip', 'gratuity',
    'rounded', 'discount', 'savings', 'count', 'guest', 'table', 'server', 'receipt',
    'total', 'approved', 'thank', 'customer', 'copy', 'batch', 'appr', 'trace',
    'sale', 'george', 'brunswick', 'new brunswick',
  ];

  // Patterns like "2 Steak", "2x Steak", "2X Steak", "2 X Steak"
  const quantityPrefixRegex = /^(\d+)\s*[xX]?\s+(.+)/;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const trimmedLower = trimmed.toLowerCase();
    const priceMatch = trimmed.match(priceRegex);

    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);

      // Classify summary lines
      if (trimmedLower.includes('subtotal') || trimmedLower.includes('sub total') || trimmedLower.includes('sub-total')) {
        subtotal = price;
        return;
      }
      if (trimmedLower.match(/\btax\b/)) {
        tax = price;
        return;
      }
      if (trimmedLower.match(/\b(tip|gratuity)\b/)) {
        tip = price;
        return;
      }
      if (trimmedLower.match(/\btotal\b/) && !trimmedLower.includes('subtotal')) {
        total = Math.max(total, price);
        return;
      }

      const isSummary = excludeKeywords.some(kw => trimmedLower.includes(kw));
      if (isSummary) return;

      // Remove the price portion and clean up
      let description = trimmed
        .replace(priceMatch[0], '')
        .replace(/\$/, '')
        .replace(/[^\w\s]/g, ' ')
        .trim();

      if (description.length < 2) return;

      // Detect leading quantity: "2 Steak", "2x Steak", "2X Steak"
      let quantity = 1;
      const qMatch = description.match(quantityPrefixRegex);
      if (qMatch) {
        const possibleQty = parseInt(qMatch[1]);
        // Only treat as quantity if it's a plausible small number (1-99)
        if (possibleQty >= 1 && possibleQty <= 99) {
          quantity = possibleQty;
          description = qMatch[2].trim();
        }
      }

      // Per-unit price: if quantity > 1, the listed price is the total for that line
      const unitPrice = quantity > 1 ? parseFloat((price / quantity).toFixed(2)) : price;

      const name = description.charAt(0).toUpperCase() + description.slice(1);
      items.push({
        id: `item-${Date.now()}-${index}`,
        name,
        price: unitPrice,
        quantity,
      });
    }
  });

  if (subtotal === 0 && items.length > 0) {
    subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  if (total === 0) {
    total = subtotal + tax + tip;
  }

  return { items, subtotal, tax, tip, total };
}
