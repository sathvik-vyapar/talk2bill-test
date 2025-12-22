// Test Cases Data - 500+ cases covering all transaction types

export interface TestCase {
  id: number;
  type: 'expense' | 'sale_invoice' | 'payment_in' | 'payment_out' | 'other';
  input: string;
  expectedIntent: string;
  expectedOutput: any;
  category: string;
  context?: string;
}

// Helper function to generate variations
const generateExpenseVariations = (baseId: number): TestCase[] => {
  const items = [
    { name: 'petrol', amounts: [100, 250, 500, 750, 1000, 1500, 2000], category: 'petrol' },
    { name: 'diesel', amounts: [200, 500, 1000, 2000, 3000], category: 'petrol' },
    { name: 'chai', amounts: [10, 15, 20, 25, 30], category: 'food' },
    { name: 'coffee', amounts: [30, 50, 80, 100, 150], category: 'food' },
    { name: 'samosa', amounts: [15, 20, 25, 30], category: 'food' },
    { name: 'lunch', amounts: [100, 150, 200, 300, 500], category: 'food' },
    { name: 'dinner', amounts: [200, 300, 500, 800], category: 'food' },
    { name: 'breakfast', amounts: [50, 100, 150, 200], category: 'food' },
    { name: 'rice', amounts: [40, 50, 60, 80, 100], category: 'groceries', unit: 'kg' },
    { name: 'wheat', amounts: [35, 45, 55, 65], category: 'groceries', unit: 'kg' },
    { name: 'sugar', amounts: [45, 50, 55, 60], category: 'groceries', unit: 'kg' },
    { name: 'oil', amounts: [150, 180, 200, 220], category: 'groceries', unit: 'liter' },
    { name: 'milk', amounts: [25, 30, 35, 40, 50], category: 'groceries', unit: 'liter' },
    { name: 'auto', amounts: [30, 50, 80, 100, 150], category: 'transport' },
    { name: 'taxi', amounts: [100, 150, 200, 300, 500], category: 'transport' },
    { name: 'bus', amounts: [20, 30, 50, 80], category: 'transport' },
    { name: 'metro', amounts: [30, 50, 80, 100], category: 'transport' },
    { name: 'electricity', amounts: [500, 1000, 1500, 2000, 2500, 3000], category: 'utilities' },
    { name: 'water', amounts: [200, 300, 500, 800], category: 'utilities' },
    { name: 'internet', amounts: [500, 700, 1000, 1500], category: 'utilities' },
    { name: 'mobile recharge', amounts: [199, 299, 399, 599, 799], category: 'utilities' },
    { name: 'medicine', amounts: [100, 200, 500, 1000], category: 'medical' },
    { name: 'doctor', amounts: [300, 500, 800, 1000], category: 'medical' },
  ];

  const templates = [
    (item: string, amount: number) => `Add ${item} for ${amount} rupees`,
    (item: string, amount: number) => `${item} ${amount}`,
    (item: string, amount: number) => `${item} expense ${amount}`,
    (item: string, amount: number) => `Spent ${amount} on ${item}`,
    (item: string, amount: number) => `${amount} rupees ${item}`,
    (item: string, amount: number) => `${item} ka ${amount} rupay`,
    (item: string, amount: number) => `${item} ke liye ${amount}`,
  ];

  const cases: TestCase[] = [];
  let id = baseId;

  items.forEach(item => {
    item.amounts.slice(0, 3).forEach(amount => {
      templates.slice(0, 2).forEach(template => {
        cases.push({
          id: id++,
          type: 'expense',
          input: template(item.name, amount),
          expectedIntent: 'expense',
          expectedOutput: { item_name: item.name, item_amount: amount },
          category: item.category,
        });
      });
    });
  });

  return cases;
};

const generateSaleInvoiceVariations = (baseId: number): TestCase[] => {
  const products = [
    { name: 'cement', unit: 'bag', rates: [300, 320, 350, 380] },
    { name: 'rice', unit: 'kg', rates: [40, 45, 50, 55] },
    { name: 'wheat', unit: 'kg', rates: [30, 35, 40, 45] },
    { name: 'sugar', unit: 'kg', rates: [45, 50, 55, 60] },
    { name: 'oil', unit: 'liter', rates: [150, 160, 180, 200] },
    { name: 'mobile cover', unit: 'piece', rates: [100, 150, 200, 250] },
    { name: 'charger', unit: 'piece', rates: [200, 300, 500, 800] },
    { name: 'earphone', unit: 'piece', rates: [150, 300, 500, 1000] },
    { name: 'notebook', unit: 'piece', rates: [30, 50, 80, 100] },
    { name: 'pen', unit: 'piece', rates: [10, 20, 30, 50] },
    { name: 'chips', unit: 'packet', rates: [10, 20, 30, 50] },
    { name: 'biscuit', unit: 'packet', rates: [20, 30, 50, 80] },
    { name: 'soap', unit: 'piece', rates: [30, 50, 80, 100] },
    { name: 'shampoo', unit: 'bottle', rates: [100, 150, 200, 300] },
  ];

  const customers = ['Sharma ji', 'Ramesh', 'Gupta ji', 'Mohan', 'customer', 'Suresh', 'Anil', 'Vijay', 'Priya', 'ABC Traders'];
  const quantities = [1, 2, 3, 5, 10, 20, 50];

  const cases: TestCase[] = [];
  let id = baseId;

  products.forEach(product => {
    product.rates.slice(0, 2).forEach(rate => {
      quantities.slice(0, 3).forEach(qty => {
        // Basic sale
        cases.push({
          id: id++,
          type: 'sale_invoice',
          input: `Sold ${qty} ${product.unit} ${product.name} at ${rate} per ${product.unit}`,
          expectedIntent: 'sale_invoice',
          expectedOutput: { items: [{ item_name: product.name, quantity: qty, rate: rate }] },
          category: 'basic',
        });

        // Sale to customer
        const customer = customers[id % customers.length];
        cases.push({
          id: id++,
          type: 'sale_invoice',
          input: `Sold ${qty} ${product.unit} ${product.name} to ${customer} at ${rate}`,
          expectedIntent: 'sale_invoice',
          expectedOutput: { customer_name: customer, items: [{ item_name: product.name, quantity: qty }] },
          category: 'with-customer',
        });
      });
    });
  });

  // Credit sales
  const creditPhrases = [
    'Credit sale', 'Udhar', 'On credit', 'Khata mein', 'Baaki', 'Account mein'
  ];
  creditPhrases.forEach((phrase, idx) => {
    [1000, 2000, 5000, 10000].forEach(amount => {
      cases.push({
        id: id++,
        type: 'sale_invoice',
        input: `${phrase} ${amount} to ${customers[idx % customers.length]}`,
        expectedIntent: 'sale_invoice',
        expectedOutput: { amount: amount, payment_status: 'unpaid' },
        category: 'credit',
      });
    });
  });

  // GST sales
  [5, 12, 18, 28].forEach(gst => {
    [1000, 5000, 10000, 25000].forEach(amount => {
      cases.push({
        id: id++,
        type: 'sale_invoice',
        input: `Sale ${amount} with ${gst}% GST`,
        expectedIntent: 'sale_invoice',
        expectedOutput: { amount: amount, gst_percent: gst },
        category: 'gst',
      });
    });
  });

  return cases;
};

const generatePaymentInVariations = (baseId: number): TestCase[] => {
  const parties = [
    'Sharma ji', 'Ramesh', 'Gupta ji', 'Mohan', 'Suresh', 'Anil', 'Vijay',
    'Priya', 'ABC Traders', 'XYZ Ltd', 'customer', 'Ravi', 'Manoj', 'Deepak'
  ];
  const amounts = [500, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 50000];
  const paymentTypes = ['cash', 'UPI', 'card', 'bank transfer', 'cheque', 'PhonePe', 'GPay', 'Paytm'];

  const templates = [
    (party: string, amount: number) => `Received ${amount} from ${party}`,
    (party: string, amount: number) => `${party} paid ${amount}`,
    (party: string, amount: number) => `Got ${amount} from ${party}`,
    (party: string, amount: number) => `${party} ne ${amount} diya`,
    (party: string, amount: number) => `${amount} mila ${party} se`,
    (party: string, amount: number) => `Payment received ${amount} from ${party}`,
  ];

  const cases: TestCase[] = [];
  let id = baseId;

  // Basic payment in
  parties.forEach(party => {
    amounts.slice(0, 4).forEach(amount => {
      templates.slice(0, 2).forEach(template => {
        cases.push({
          id: id++,
          type: 'payment_in',
          input: template(party, amount),
          expectedIntent: 'payment_in',
          expectedOutput: { party_name: party, amount: amount },
          category: 'basic',
        });
      });
    });
  });

  // With payment type
  parties.slice(0, 5).forEach(party => {
    paymentTypes.forEach(payType => {
      const amount = amounts[id % amounts.length];
      cases.push({
        id: id++,
        type: 'payment_in',
        input: `Received ${amount} from ${party} via ${payType}`,
        expectedIntent: 'payment_in',
        expectedOutput: { party_name: party, amount: amount, payment_type: payType.toLowerCase() },
        category: 'with-payment-type',
      });
    });
  });

  // Advance payments
  parties.slice(0, 5).forEach(party => {
    [5000, 10000, 20000].forEach(amount => {
      cases.push({
        id: id++,
        type: 'payment_in',
        input: `Advance payment ${amount} from ${party}`,
        expectedIntent: 'payment_in',
        expectedOutput: { party_name: party, amount: amount, description: 'advance' },
        category: 'advance',
      });
    });
  });

  return cases;
};

const generatePaymentOutVariations = (baseId: number): TestCase[] => {
  const parties = [
    'supplier', 'vendor', 'Ramesh', 'Mohan', 'landlord', 'contractor',
    'electrician', 'plumber', 'staff', 'Sharma', 'dealer', 'wholesaler'
  ];
  const amounts = [500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 40000, 50000];
  const purposes = ['rent', 'salary', 'electricity', 'maintenance', 'stock', 'supplies', 'advance'];

  const templates = [
    (party: string, amount: number) => `Paid ${amount} to ${party}`,
    (party: string, amount: number) => `Gave ${amount} to ${party}`,
    (party: string, amount: number) => `${party} ko ${amount} diya`,
    (party: string, amount: number) => `Payment of ${amount} to ${party}`,
    (party: string, amount: number) => `${amount} paid to ${party}`,
  ];

  const cases: TestCase[] = [];
  let id = baseId;

  // Basic payment out
  parties.forEach(party => {
    amounts.slice(0, 4).forEach(amount => {
      templates.slice(0, 2).forEach(template => {
        cases.push({
          id: id++,
          type: 'payment_out',
          input: template(party, amount),
          expectedIntent: 'payment_out',
          expectedOutput: { party_name: party, amount: amount },
          category: 'basic',
        });
      });
    });
  });

  // With purpose
  purposes.forEach(purpose => {
    amounts.slice(0, 3).forEach(amount => {
      cases.push({
        id: id++,
        type: 'payment_out',
        input: `${purpose} payment ${amount}`,
        expectedIntent: 'payment_out',
        expectedOutput: { amount: amount, description: purpose },
        category: 'with-purpose',
      });
    });
  });

  // Salary payments
  ['Ramesh', 'Mohan', 'Suresh', 'Anil', 'staff'].forEach(person => {
    [10000, 12000, 15000, 20000, 25000].forEach(amount => {
      cases.push({
        id: id++,
        type: 'payment_out',
        input: `Salary ${amount} to ${person}`,
        expectedIntent: 'payment_out',
        expectedOutput: { party_name: person, amount: amount, description: 'salary' },
        category: 'salary',
      });
    });
  });

  return cases;
};

const generateOtherVariations = (baseId: number): TestCase[] => {
  const greetings = [
    'Hello', 'Hi', 'Namaste', 'Good morning', 'Good evening', 'Hey',
    'Haan', 'Ji', 'Bolo', 'Kya haal hai'
  ];

  const queries = [
    'What can you do?', 'How does this work?', 'Help me', 'Show me options',
    'Kya kar sakte ho?', 'Batao kya hota hai', 'Help karo'
  ];

  const unrelated = [
    'Tell me a joke', 'What is the weather?', 'Who are you?',
    'Play music', 'What time is it?', 'Calculate 2+2'
  ];

  const cases: TestCase[] = [];
  let id = baseId;

  greetings.forEach(greeting => {
    cases.push({
      id: id++,
      type: 'other',
      input: greeting,
      expectedIntent: 'other',
      expectedOutput: null,
      category: 'greeting',
    });
  });

  queries.forEach(query => {
    cases.push({
      id: id++,
      type: 'other',
      input: query,
      expectedIntent: 'other',
      expectedOutput: null,
      category: 'query',
    });
  });

  unrelated.forEach(text => {
    cases.push({
      id: id++,
      type: 'other',
      input: text,
      expectedIntent: 'other',
      expectedOutput: null,
      category: 'unrelated',
    });
  });

  return cases;
};

// Generate all test cases
export const generateAllTestCases = (): TestCase[] => {
  const allCases: TestCase[] = [];

  // Base manual test cases (keeping original 100)
  const baseCases: TestCase[] = [
    // Expense - Basic (1-20)
    { id: 1, type: 'expense', input: 'Add petrol for 500 rupees', expectedIntent: 'expense', expectedOutput: { item_name: 'petrol', item_amount: 500 }, category: 'basic' },
    { id: 2, type: 'expense', input: 'Chai samosa 140', expectedIntent: 'expense', expectedOutput: { items: [{ item_name: 'chai' }, { item_name: 'samosa' }] }, category: 'multi-item' },
    { id: 3, type: 'expense', input: 'One coffee for 100', expectedIntent: 'expense', expectedOutput: { item_name: 'coffee', item_amount: 100, item_qty: 1 }, category: 'basic' },
    { id: 4, type: 'expense', input: 'Salary for Ramesh 15000', expectedIntent: 'expense', expectedOutput: { item_name: 'Ramesh', item_amount: 15000, expense_category: 'salary' }, category: 'salary' },
    { id: 5, type: 'expense', input: '2 kg rice 80 rupees', expectedIntent: 'expense', expectedOutput: { item_name: 'rice', item_amount: 80, item_qty: 2 }, category: 'quantity' },
    { id: 6, type: 'expense', input: 'Electricity bill 2500', expectedIntent: 'expense', expectedOutput: { item_name: 'electricity', item_amount: 2500, expense_category: 'utilities' }, category: 'utilities' },
    { id: 7, type: 'expense', input: 'Diesel 50 liters 4500 by card', expectedIntent: 'expense', expectedOutput: { item_amount: 4500, payment_type: 'card' }, category: 'payment' },
    { id: 8, type: 'expense', input: 'Add milk and apples 50 each', expectedIntent: 'expense', expectedOutput: { items: [{ item_name: 'milk', item_amount: 50 }, { item_name: 'apples', item_amount: 50 }] }, category: 'each-price' },
    { id: 9, type: 'expense', input: 'Petrol ke liye 500 rupay', expectedIntent: 'expense', expectedOutput: { item_name: 'petrol', item_amount: 500 }, category: 'hinglish' },
    { id: 10, type: 'expense', input: 'Transport auto 150', expectedIntent: 'expense', expectedOutput: { item_name: 'auto', item_amount: 150, expense_category: 'transport' }, category: 'transport' },
    { id: 11, type: 'expense', input: 'yes', expectedIntent: 'expense', expectedOutput: null, category: 'affirmation', context: 'After "Add another item?"' },
    { id: 12, type: 'expense', input: 'no', expectedIntent: 'expense', expectedOutput: null, category: 'completion', context: 'After "Add another item?"' },
    { id: 13, type: 'expense', input: '500', expectedIntent: 'expense', expectedOutput: { item_amount: 500 }, category: 'number-only', context: 'After "Amount?"' },
    { id: 14, type: 'expense', input: 'food', expectedIntent: 'expense', expectedOutput: { expense_category: 'food' }, category: 'category-only', context: 'After "Which category?"' },
    { id: 15, type: 'expense', input: 'cancel', expectedIntent: 'expense', expectedOutput: null, category: 'cancellation' },
    { id: 16, type: 'expense', input: 'Add 100 and 200 rupees', expectedIntent: 'expense', expectedOutput: { items: [{ item_amount: 100 }, { item_amount: 200 }] }, category: 'amount-only' },
    { id: 17, type: 'expense', input: 'paid through sbi bank', expectedIntent: 'expense', expectedOutput: { payment_type: 'sbi bank' }, category: 'bank-payment' },
    { id: 18, type: 'expense', input: 'via phonepe', expectedIntent: 'expense', expectedOutput: { payment_type: 'phonepe' }, category: 'upi-payment' },
    { id: 19, type: 'expense', input: 'Create category travel expense and add petrol', expectedIntent: 'expense', expectedOutput: { expense_category: 'travel expense' }, category: 'custom-category' },
    { id: 20, type: 'expense', input: 'apple 5000 total and i took 3 kgs', expectedIntent: 'expense', expectedOutput: { item_amount: 1666.67, item_qty: 3 }, category: 'total-calc' },

    // Payment In (21-35)
    { id: 21, type: 'payment_in', input: 'Received 5000 from Sharma ji', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Sharma ji', amount: 5000 }, category: 'basic' },
    { id: 22, type: 'payment_in', input: 'Ramesh paid me 2000', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Ramesh', amount: 2000 }, category: 'basic' },
    { id: 23, type: 'payment_in', input: 'Got payment from Manoj 1500 UPI', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Manoj', amount: 1500, payment_type: 'upi' }, category: 'upi' },
    { id: 24, type: 'payment_in', input: 'Customer payment 800 cash', expectedIntent: 'payment_in', expectedOutput: { amount: 800, payment_type: 'cash' }, category: 'basic' },
    { id: 25, type: 'payment_in', input: 'ABC Electronics ne 15000 diya', expectedIntent: 'payment_in', expectedOutput: { party_name: 'ABC Electronics', amount: 15000 }, category: 'hinglish' },
    { id: 26, type: 'payment_in', input: 'Yesterday received 3000 from Ravi', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Ravi', amount: 3000 }, category: 'date' },
    { id: 27, type: 'payment_in', input: 'Payment from 9876543210 for 2500', expectedIntent: 'payment_in', expectedOutput: { phone: '9876543210', amount: 2500 }, category: 'phone' },
    { id: 28, type: 'payment_in', input: 'Advance payment 10000 from new customer', expectedIntent: 'payment_in', expectedOutput: { amount: 10000, description: 'advance' }, category: 'advance' },
    { id: 29, type: 'payment_in', input: '5000', expectedIntent: 'payment_in', expectedOutput: { amount: 5000 }, category: 'amount-only', context: 'After "Amount?"' },
    { id: 30, type: 'payment_in', input: 'Suresh', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Suresh' }, category: 'name-only', context: 'After "Customer name?"' },
    { id: 31, type: 'payment_in', input: 'Bank transfer 25000 from dealer', expectedIntent: 'payment_in', expectedOutput: { amount: 25000, payment_type: 'bank transfer' }, category: 'bank' },
    { id: 32, type: 'payment_in', input: 'Cheque received 50000 from XYZ Ltd', expectedIntent: 'payment_in', expectedOutput: { party_name: 'XYZ Ltd', amount: 50000, payment_type: 'cheque' }, category: 'cheque' },
    { id: 33, type: 'payment_in', input: 'Old balance 3000 cleared by Mohan', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Mohan', amount: 3000 }, category: 'balance' },
    { id: 34, type: 'payment_in', input: 'GPay pe 1200 aaya Priya se', expectedIntent: 'payment_in', expectedOutput: { party_name: 'Priya', amount: 1200, payment_type: 'gpay' }, category: 'hinglish-upi' },
    { id: 35, type: 'payment_in', input: 'Part payment received 5000 out of 15000', expectedIntent: 'payment_in', expectedOutput: { amount: 5000 }, category: 'partial' },

    // Payment Out (36-50)
    { id: 36, type: 'payment_out', input: 'Paid 5000 to supplier', expectedIntent: 'payment_out', expectedOutput: { party_name: 'supplier', amount: 5000 }, category: 'basic' },
    { id: 37, type: 'payment_out', input: 'I gave Ramesh 2000', expectedIntent: 'payment_out', expectedOutput: { party_name: 'Ramesh', amount: 2000 }, category: 'basic' },
    { id: 38, type: 'payment_out', input: 'Payment to vendor 15000 bank transfer', expectedIntent: 'payment_out', expectedOutput: { amount: 15000, payment_type: 'bank transfer' }, category: 'bank' },
    { id: 39, type: 'payment_out', input: 'Paid electricity bill 2500', expectedIntent: 'payment_out', expectedOutput: { amount: 2500, description: 'electricity bill' }, category: 'bill' },
    { id: 40, type: 'payment_out', input: 'Manoj ko 1200 diya', expectedIntent: 'payment_out', expectedOutput: { party_name: 'Manoj', amount: 1200 }, category: 'hinglish' },
    { id: 41, type: 'payment_out', input: 'Rent payment 25000 to landlord', expectedIntent: 'payment_out', expectedOutput: { party_name: 'landlord', amount: 25000, description: 'rent' }, category: 'rent' },
    { id: 42, type: 'payment_out', input: 'Staff salary 40000', expectedIntent: 'payment_out', expectedOutput: { amount: 40000, description: 'salary' }, category: 'salary' },
    { id: 43, type: 'payment_out', input: 'Advance to contractor 20000', expectedIntent: 'payment_out', expectedOutput: { party_name: 'contractor', amount: 20000, description: 'advance' }, category: 'advance' },
    { id: 44, type: 'payment_out', input: '3000', expectedIntent: 'payment_out', expectedOutput: { amount: 3000 }, category: 'amount-only', context: 'After "Amount?"' },
    { id: 45, type: 'payment_out', input: 'Priya', expectedIntent: 'payment_out', expectedOutput: { party_name: 'Priya' }, category: 'name-only', context: 'After "Who did you pay?"' },
    { id: 46, type: 'payment_out', input: 'UPI payment 800 to electrician', expectedIntent: 'payment_out', expectedOutput: { party_name: 'electrician', amount: 800, payment_type: 'upi' }, category: 'upi' },
    { id: 47, type: 'payment_out', input: 'Cheque issued 100000 to wholesaler', expectedIntent: 'payment_out', expectedOutput: { party_name: 'wholesaler', amount: 100000, payment_type: 'cheque' }, category: 'cheque' },
    { id: 48, type: 'payment_out', input: 'Maintenance charges 5000', expectedIntent: 'payment_out', expectedOutput: { amount: 5000, description: 'maintenance' }, category: 'maintenance' },
    { id: 49, type: 'payment_out', input: 'Stock purchase payment 75000', expectedIntent: 'payment_out', expectedOutput: { amount: 75000, description: 'stock purchase' }, category: 'stock' },
    { id: 50, type: 'payment_out', input: 'Office supplies 2500 paid cash', expectedIntent: 'payment_out', expectedOutput: { amount: 2500, payment_type: 'cash' }, category: 'supplies' },

    // Sale Invoice (51-85)
    { id: 51, type: 'sale_invoice', input: 'Sold 5 bags cement to Sharma ji at 350 per bag', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Sharma ji', items: [{ item_name: 'cement', quantity: 5, rate: 350, amount: 1750 }] }, category: 'basic' },
    { id: 52, type: 'sale_invoice', input: 'Cash sale 1000 rupees', expectedIntent: 'sale_invoice', expectedOutput: { amount: 1000, payment_type: 'cash', payment_status: 'paid' }, category: 'basic' },
    { id: 53, type: 'sale_invoice', input: 'Becha 10 kg rice 40 per kg to Ramesh', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Ramesh', items: [{ item_name: 'rice', quantity: 10, rate: 40, amount: 400 }] }, category: 'hinglish' },
    { id: 54, type: 'sale_invoice', input: 'Sale of 20 pieces mobile cover 150 each', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'mobile cover', quantity: 20, rate: 150, amount: 3000 }] }, category: 'quantity' },
    { id: 55, type: 'sale_invoice', input: 'Sold TV to customer for 35000', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'TV', amount: 35000 }] }, category: 'electronics' },
    { id: 56, type: 'sale_invoice', input: 'Credit sale to Gupta ji 5000', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Gupta ji', amount: 5000, payment_status: 'unpaid' }, category: 'credit' },
    { id: 57, type: 'sale_invoice', input: 'Udhar becha Mohan ko 2500 ka saman', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Mohan', amount: 2500, payment_status: 'unpaid' }, category: 'hinglish-credit' },
    { id: 58, type: 'sale_invoice', input: 'Sold goods worth 10000 on credit to ABC Traders', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'ABC Traders', amount: 10000, payment_status: 'unpaid' }, category: 'credit' },
    { id: 59, type: 'sale_invoice', input: 'Partial payment sale 15000, received 5000', expectedIntent: 'sale_invoice', expectedOutput: { amount: 15000, payment_status: 'partial' }, category: 'partial' },
    { id: 60, type: 'sale_invoice', input: 'Sale on account to XYZ Ltd 25000', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'XYZ Ltd', amount: 25000, payment_status: 'unpaid' }, category: 'credit' },
    { id: 61, type: 'sale_invoice', input: 'Sold 5 kg sugar and 10 kg rice to Sharma', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Sharma', items: [{ item_name: 'sugar', quantity: 5 }, { item_name: 'rice', quantity: 10 }] }, category: 'multi-item' },
    { id: 62, type: 'sale_invoice', input: 'Sale of pen 10 pieces, pencil 20 pieces, eraser 15 pieces', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'pen', quantity: 10 }, { item_name: 'pencil', quantity: 20 }, { item_name: 'eraser', quantity: 15 }] }, category: 'multi-item' },
    { id: 63, type: 'sale_invoice', input: 'Sale with 18% GST total 11800 to ABC Company', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'ABC Company', amount: 11800, gst_percent: 18 }, category: 'gst' },
    { id: 64, type: 'sale_invoice', input: 'GST invoice 5000 plus 12% GST', expectedIntent: 'sale_invoice', expectedOutput: { amount: 5600, gst_percent: 12 }, category: 'gst' },
    { id: 65, type: 'sale_invoice', input: 'Wholesale 100 bags cement 320 per bag to dealer', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'cement', quantity: 100, rate: 320, amount: 32000 }] }, category: 'wholesale' },
    { id: 66, type: 'sale_invoice', input: 'Bulk sale 500 pieces at 25 each total 12500', expectedIntent: 'sale_invoice', expectedOutput: { quantity: 500, rate: 25, amount: 12500 }, category: 'bulk' },
    { id: 67, type: 'sale_invoice', input: 'Service charge 2000 for AC repair', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'AC repair', amount: 2000 }] }, category: 'service' },
    { id: 68, type: 'sale_invoice', input: 'Consultation fee 5000 from client', expectedIntent: 'sale_invoice', expectedOutput: { amount: 5000 }, category: 'service' },
    { id: 69, type: 'sale_invoice', input: 'Sale 5000 received via UPI', expectedIntent: 'sale_invoice', expectedOutput: { amount: 5000, payment_type: 'upi', payment_status: 'paid' }, category: 'upi' },
    { id: 70, type: 'sale_invoice', input: 'Card payment sale 8000', expectedIntent: 'sale_invoice', expectedOutput: { amount: 8000, payment_type: 'card', payment_status: 'paid' }, category: 'card' },
    { id: 71, type: 'sale_invoice', input: 'Sale by cheque 25000 from Gupta Traders', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Gupta Traders', amount: 25000, payment_type: 'cheque' }, category: 'cheque' },
    { id: 72, type: 'sale_invoice', input: 'Sale 10000 with 10% discount to regular customer', expectedIntent: 'sale_invoice', expectedOutput: { amount: 9000, discount: 10 }, category: 'discount' },
    { id: 73, type: 'sale_invoice', input: 'Sold at 500 off on MRP 2000', expectedIntent: 'sale_invoice', expectedOutput: { amount: 1500, discount: 500 }, category: 'discount' },
    { id: 74, type: 'sale_invoice', input: 'Sharma ji ko 5 bag cement becha 350 wala', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Sharma ji', items: [{ item_name: 'cement', quantity: 5, rate: 350 }] }, category: 'hinglish' },
    { id: 75, type: 'sale_invoice', input: 'Aaj ki sale 15000 cash mein', expectedIntent: 'sale_invoice', expectedOutput: { amount: 15000, payment_type: 'cash' }, category: 'hinglish' },
    { id: 76, type: 'sale_invoice', input: 'Customer ne 2000 ka saman liya udhar', expectedIntent: 'sale_invoice', expectedOutput: { amount: 2000, payment_status: 'unpaid' }, category: 'hinglish' },
    { id: 77, type: 'sale_invoice', input: 'Sale return 500 from customer', expectedIntent: 'sale_invoice', expectedOutput: { amount: -500, type: 'return' }, category: 'return' },
    { id: 78, type: 'sale_invoice', input: 'Credit note for 1500 to Sharma', expectedIntent: 'sale_invoice', expectedOutput: { customer_name: 'Sharma', amount: -1500, type: 'credit_note' }, category: 'return' },
    { id: 79, type: 'sale_invoice', input: 'Sale', expectedIntent: 'sale_invoice', expectedOutput: null, category: 'incomplete' },
    { id: 80, type: 'sale_invoice', input: '5000', expectedIntent: 'sale_invoice', expectedOutput: { amount: 5000 }, category: 'amount-only', context: 'After "Sale amount?"' },
    { id: 81, type: 'sale_invoice', input: 'Laptop sale 45000 to customer', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'Laptop', amount: 45000 }] }, category: 'electronics' },
    { id: 82, type: 'sale_invoice', input: 'Sold vegetables tomato 2kg onion 3kg', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'tomato', quantity: 2 }, { item_name: 'onion', quantity: 3 }] }, category: 'multi-item' },
    { id: 83, type: 'sale_invoice', input: 'Annual maintenance contract 24000', expectedIntent: 'sale_invoice', expectedOutput: { items: [{ item_name: 'AMC', amount: 24000 }] }, category: 'service' },
    { id: 84, type: 'sale_invoice', input: 'Distributor order worth 1 lakh', expectedIntent: 'sale_invoice', expectedOutput: { amount: 100000 }, category: 'wholesale' },
    { id: 85, type: 'sale_invoice', input: 'Festival offer 20% discount sale 8000', expectedIntent: 'sale_invoice', expectedOutput: { amount: 6400, discount: 20 }, category: 'discount' },

    // Other (86-100)
    { id: 86, type: 'other', input: 'Hello', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
    { id: 87, type: 'other', input: 'What can you do?', expectedIntent: 'other', expectedOutput: null, category: 'capability' },
    { id: 88, type: 'other', input: 'How do I add expense?', expectedIntent: 'other', expectedOutput: null, category: 'help' },
    { id: 89, type: 'other', input: 'How much did I spend last month?', expectedIntent: 'other', expectedOutput: null, category: 'query' },
    { id: 90, type: 'other', input: 'Tell me a joke', expectedIntent: 'other', expectedOutput: null, category: 'unrelated' },
    { id: 91, type: 'other', input: 'Hi there', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
    { id: 92, type: 'other', input: 'Good morning', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
    { id: 93, type: 'other', input: 'Namaste', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
    { id: 94, type: 'other', input: 'Show my transactions', expectedIntent: 'other', expectedOutput: null, category: 'query' },
    { id: 95, type: 'other', input: 'Delete last entry', expectedIntent: 'other', expectedOutput: null, category: 'action' },
    { id: 96, type: 'other', input: 'Undo', expectedIntent: 'other', expectedOutput: null, category: 'action' },
    { id: 97, type: 'other', input: 'What is my balance?', expectedIntent: 'other', expectedOutput: null, category: 'query' },
    { id: 98, type: 'other', input: 'Thanks', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
    { id: 99, type: 'other', input: 'Bye', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
    { id: 100, type: 'other', input: 'Kya haal hai?', expectedIntent: 'other', expectedOutput: null, category: 'greeting' },
  ];

  allCases.push(...baseCases);

  // Add generated variations
  allCases.push(...generateExpenseVariations(101));
  allCases.push(...generateSaleInvoiceVariations(300));
  allCases.push(...generatePaymentInVariations(500));
  allCases.push(...generatePaymentOutVariations(650));
  allCases.push(...generateOtherVariations(800));

  // Renumber all cases to ensure unique IDs
  return allCases.map((tc, index) => ({ ...tc, id: index + 1 }));
};

export const testCasesData = generateAllTestCases();
