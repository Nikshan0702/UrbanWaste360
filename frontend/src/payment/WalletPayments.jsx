// src/components/WalletPayments.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FaWallet, FaMoneyBillWave, FaCreditCard, FaHistory, FaShieldAlt } from 'react-icons/fa';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { authFetch } from '../api';            // your existing helper
import { Card, CardHeader, CardBody } from '../admin/Card';

export default function WalletPayments() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [history, setHistory] = useState([]);

  const [amountWallet, setAmountWallet] = useState('');
  const [amountCard, setAmountCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holder, setHolder] = useState('');

  const [loadingWalletPay, setLoadingWalletPay] = useState(false);
  const [loadingCardPay, setLoadingCardPay] = useState(false);
  const [notice, setNotice] = useState('');

  // validation state
  const [errors, setErrors] = useState({ amount: '', number: '', expiry: '', cvv: '', holder: '' });
  const [touched, setTouched] = useState({ amount: false, number: false, expiry: false, cvv: false, holder: false });

  const onlyDigits = (s = '') => (s || '').replace(/\D/g, '');
  const clamp = (n) => (Number.isFinite(n) ? n : 0);

  // format + detect brand
  const formatCardNumber = v => onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  const detectBrand = (num) => {
    const d = onlyDigits(num);
    if (/^4\d{0,18}$/.test(d)) return 'visa';
    if (/^5[1-5]\d{0,14}$/.test(d) || /^2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720)\d{0,12}$/.test(d)) return 'mastercard';
    if (/^3[47]\d{0,13}$/.test(d)) return 'amex';
    return 'other';
  };
  const luhn = (num) => {
    const s = onlyDigits(num);
    if (s.length < 13) return false;
    let sum = 0, dbl = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = parseInt(s[i], 10);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  };

  // validators
  const validateNumber = (num) => {
    const clean = onlyDigits(num);
    if (!clean) return 'Card number is required';
    if (clean.length < 13) return 'Card number is too short';
    // if (!luhn(clean)) return 'Invalid card number';
    return '';
  };
  const validateExpiry = (exp) => {
    if (!exp) return 'Expiry is required';
    const m = exp.match(/^(\d{1,2})\s*\/\s*(\d{2})$/);
    if (!m) return 'Use MM/YY format';
    const month = parseInt(m[1], 10);
    if (month < 1 || month > 12) return 'Invalid month';
    const year = 2000 + parseInt(m[2], 10);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    if (endOfMonth < new Date()) return 'Card expired';
    return '';
  };
  const validateCvv = (v, brand) => {
    const d = onlyDigits(v);
    if (!d) return 'CVV is required';
    const len = brand === 'amex' ? 4 : 3;
    if (d.length !== len) return `CVV must be ${len} digits`;
    return '';
  };
  const validateHolder = (h) => {
    if (!h || !h.trim()) return 'Cardholder name is required';
    if (h.trim().length < 2) return 'Enter full name';
    return '';
  };
  const validateAmount = (amtStr) => {
    const amt = parseFloat(amtStr);
    if (!amt || amt <= 0) return 'Enter a valid amount';
    if (outstanding > 0 && amt > outstanding) return 'Cannot exceed outstanding total';
    return '';
  };

  const brand = detectBrand(cardNumber);
  const isValid =
    !validateAmount(amountCard) &&
    !validateNumber(cardNumber) &&
    !validateExpiry(expiry) &&
    !validateCvv(cvv, brand) &&
    !validateHolder(holder) &&
    outstanding > 0;

  // input handlers
  const markTouched = (k) => setTouched(p => ({ ...p, [k]: true }));
  const onNumberChange  = e => { const v = formatCardNumber(e.target.value); setCardNumber(v); if (touched.number) setErrors(p=>({...p,number:validateNumber(v)})); };
  const onExpiryChange  = e => { let v = e.target.value.replace(/[^\d/]/g,'').slice(0,5); if (/^\d{3}$/.test(v)) v = v.slice(0,2)+'/'+v.slice(2); setExpiry(v); if (touched.expiry) setErrors(p=>({...p,expiry:validateExpiry(v)})); };
  const onCvvChange     = e => { const max = brand==='amex'?4:3; const v = onlyDigits(e.target.value).slice(0,max); setCvv(v); if (touched.cvv) setErrors(p=>({...p,cvv:validateCvv(v,brand)})); };
  const onHolderChange  = e => { const v = e.target.value; setHolder(v); if (touched.holder) setErrors(p=>({...p,holder:validateHolder(v)})); };
  const onAmountChange  = e => { const v = e.target.value; setAmountCard(v); if (touched.amount) setErrors(p=>({...p,amount:validateAmount(v)})); };

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    refreshAll();
  }, [user?.id]);

  const refreshAll = async () => {
    setNotice('');
    await Promise.all([fetchWallet(), fetchOutstanding(), fetchHistory()]);
  };

  // IMPORTANT: pass residentId in dev mode (your authFetch already can append it, but here it’s explicit)
  const fetchWallet = async () => {
    try {
      const r = await authFetch(`/api/payments/wallet?residentId=${encodeURIComponent(user.id)}`);
      if (r.ok) setWallet(Number((await r.json()).balance || 0));
    } catch { setNotice('Could not reach wallet API.'); }
  };
  const fetchOutstanding = async () => {
    try {
      const r = await authFetch(`/api/payments/outstanding?residentId=${encodeURIComponent(user.id)}`);
      if (r.ok) setOutstanding(Math.max(0, Number((await r.json()).outstanding || 0)));
    } catch { setNotice('Could not reach outstanding API.'); }
  };
  const fetchHistory = async () => {
    try {
      const r = await authFetch(`/api/payments/history/${encodeURIComponent(user.id)}?residentId=${encodeURIComponent(user.id)}`);
      if (r.ok) setHistory(await r.json());
    } catch { setNotice('Could not reach history API.'); }
  };

  const totalIncome = useMemo(() =>
    history.filter(h => String(h.type).toLowerCase() === 'income')
           .reduce((s, x) => s + (x.amount || 0), 0), [history]);
  const totalPayments = useMemo(() =>
    history.filter(h => String(h.type).toLowerCase() === 'payment')
           .reduce((s, x) => s + (x.amount || 0), 0), [history]);

  const makeCardToken = () => {
    const last4 = (cardNumber || '').replace(/\s+/g, '').slice(-4);
    const exp = (expiry || '').replace(/\D/g, '');
    return last4 ? `tok_${last4}_${exp || 'XXXX'}` : '';
  };

  const postSettle = ({ amount, method, cardToken }) =>
    authFetch(`/api/payments/settle?residentId=${encodeURIComponent(user.id)}`, {
      method: 'POST',
      body: { amount, method, cardToken }
    });

  const payWithWallet = async () => {
    const amt = parseFloat(amountWallet);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (amt > wallet) return alert('Insufficient wallet balance');
    setLoadingWalletPay(true);
    try {
      const r = await postSettle({ amount: amt, method: 'WALLET' });
      if (r.ok) {
        setAmountWallet('');
        await Promise.all([fetchWallet(), fetchOutstanding(), fetchHistory()]);
        alert('Paid with wallet');
      } else { alert(await r.text()); }
    } finally { setLoadingWalletPay(false); }
  };

  const payWithCard = async () => {
    const amt = parseFloat(amountCard);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (!cardNumber || !expiry || !cvv || !holder) return alert('Enter all card details');
    setLoadingCardPay(true);
    try {
      const token = makeCardToken();
      const r = await postSettle({ amount: amt, method: 'CARD', cardToken: token });
      if (r.ok) {
        setAmountCard(''); setCardNumber(''); setExpiry(''); setCvv(''); setHolder('');
        await Promise.all([fetchWallet(), fetchOutstanding(), fetchHistory()]);
        alert('Card payment successful');
      } else { alert(await r.text()); }
    } finally { setLoadingCardPay(false); }
  };

  const payWithCardValidated = async () => {
    const errs = {
      amount: validateAmount(amountCard),
      number: validateNumber(cardNumber),
      expiry: validateExpiry(expiry),
      cvv: validateCvv(cvv, brand),
      holder: validateHolder(holder),
    };
    setErrors(errs);
    setTouched({ amount: true, number: true, expiry: true, cvv: true, holder: true });
    const anyError = Object.values(errs).some(Boolean);
    if (anyError || outstanding <= 0) return;
    await payWithCard();
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">🔒</div>
          Please log in to access Wallet & Payments.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {notice && <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl">{notice}</div>}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-emerald-500 to-teal-600 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold mt-2">LKR {wallet.toFixed(2)}</p>
                <button onClick={fetchWallet} className="text-xs mt-2 px-2 py-1 rounded bg-white/15 hover:bg-white/25">Refresh</button>
              </div>
              <FaWallet className="text-4xl opacity-90" />
            </div>
          </div>

         
          <div className="rounded-2xl text-white p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Due</p>
                <div className="text-3xl font-extrabold text-white">LKR {outstanding.toFixed(2)}</div>
              </div>
              <FaCreditCard className="text-4xl opacity-90" />
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet */}
          <Card>
            <CardHeader title="Pay with Wallet" icon={<FaWallet className="text-emerald-600" />} right={<span className="text-xs text-gray-500">Balance: LKR {wallet.toFixed(2)}</span>} />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (LKR)</label>
                  <div className="flex gap-2">
                    <input type="number" min="0.01" step="0.01" value={amountWallet} onChange={e => setAmountWallet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
                    <button type="button" onClick={() => setAmountWallet(outstanding.toFixed(2))}
                      className="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm">Full</button>
                  </div>
                </div>
                <button
                  onClick={payWithWallet}
                  disabled={loadingWalletPay || !amountWallet || outstanding <= 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60">
                  {loadingWalletPay ? 'Processing…' : 'Pay from Wallet'}
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Card with validation */}
          <Card>
            <CardHeader title="Pay with Card" icon={<FaCreditCard className="text-indigo-600" />} />
            <CardBody>
              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-700">Amount (LKR)</label>
                    <button
                      type="button"
                      onClick={() => { setAmountCard(outstanding.toFixed(2)); setErrors(p=>({...p, amount: ''})); }}
                      className="text-xs px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                    >
                      Pay full ({`LKR ${clamp(outstanding).toFixed(2)}`})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amountCard}
                    onChange={onAmountChange}
                    onBlur={() => { markTouched('amount'); setErrors(p=>({...p, amount: validateAmount(amountCard)})); }}
                    aria-invalid={Boolean(touched.amount && errors.amount)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      touched.amount && errors.amount ? 'border-rose-400' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {touched.amount && errors.amount && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1"><FaExclamationCircle />{errors.amount}</p>
                  )}
                </div>

                {/* Card number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-700">Card Number</label>
                    <div className="flex items-center gap-1 text-gray-500">
                      {brand === 'visa' && <FaCcVisa />}
                      {brand === 'mastercard' && <FaCcMastercard />}
                      {brand === 'amex' && <FaCcAmex />}
                      {brand === 'other' && <FaCreditCard />}
                    </div>
                  </div>
                  <input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={onNumberChange}
                    onBlur={() => { markTouched('number'); setErrors(p=>({...p, number: validateNumber(cardNumber)})); }}
                    inputMode="numeric"
                    aria-invalid={Boolean(touched.number && errors.number)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      touched.number && errors.number ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                  {touched.number && errors.number ? (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1"><FaExclamationCircle />{errors.number}</p>
                  ) : (
                    !!onlyDigits(cardNumber).length && luhn(cardNumber) && (
                      <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1"><FaCheckCircle />Looks good</p>
                    )
                  )}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={onExpiryChange}
                      onBlur={() => { markTouched('expiry'); setErrors(p=>({...p, expiry: validateExpiry(expiry)})); }}
                      inputMode="numeric"
                      aria-invalid={Boolean(touched.expiry && errors.expiry)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        touched.expiry && errors.expiry ? 'border-rose-400' : 'border-gray-300'
                      }`}
                    />
                    {touched.expiry && errors.expiry && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1"><FaExclamationCircle />{errors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm text-gray-700">CVV</label>
                      <span className="text-xs text-gray-500">{brand === 'amex' ? '4 digits' : '3 digits'}</span>
                    </div>
                    <input
                      placeholder={brand === 'amex' ? '1234' : '123'}
                      value={cvv}
                      onChange={onCvvChange}
                      onBlur={() => { markTouched('cvv'); setErrors(p=>({...p, cvv: validateCvv(cvv, brand)})); }}
                      inputMode="numeric"
                      aria-invalid={Boolean(touched.cvv && errors.cvv)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        touched.cvv && errors.cvv ? 'border-rose-400' : 'border-gray-300'
                      }`}
                    />
                    {touched.cvv && errors.cvv && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1"><FaExclamationCircle />{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Holder */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    placeholder="As printed on card"
                    value={holder}
                    onChange={onHolderChange}
                    onBlur={() => { markTouched('holder'); setErrors(p=>({...p, holder: validateHolder(holder)})); }}
                    aria-invalid={Boolean(touched.holder && errors.holder)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      touched.holder && errors.holder ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                  {touched.holder && errors.holder && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1"><FaExclamationCircle />{errors.holder}</p>
                  )}
                </div>

                {/* Pay button */}
                <button
                  onClick={payWithCardValidated}
                  disabled={loadingCardPay || !isValid}
                  className={`w-full text-white py-2.5 rounded-lg font-semibold disabled:opacity-60 ${
                    isValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400'
                  }`}
                >
                  {loadingCardPay ? 'Processing…' : `Pay LKR ${clamp(parseFloat(amountCard)).toFixed(2) || '0.00'} with Card`}
                </button>

                <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                  <FaShieldAlt className="text-emerald-500" />
                  We don’t store raw card details. A temporary token is generated and used for this payment.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* History */}
        <Card>
          <CardHeader title="Transaction History" icon={<FaHistory className="text-indigo-600" />} right={
            <div className="text-sm text-gray-500">Showing {history.length} record{history.length !== 1 ? 's' : ''}</div>
          } />
          <CardBody>
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No transactions yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {history.map((p, i) => {
                  const isIncome = String(p.type).toLowerCase() === 'income';
                  const status = String(p.status || '').toUpperCase();
                  const chip =
                    status === 'COMPLETED' ? 'text-green-700 bg-green-100' :
                    status === 'FAILED' ? 'text-rose-700 bg-rose-100'  : 'text-yellow-700 bg-yellow-100';
                  return (
                    <div key={p.id || `${p.createdAt}-${i}`} className="p-4 rounded-xl border border-gray-200 hover:shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                          {isIncome ? <FaMoneyBillWave /> : <FaCreditCard />}
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${chip}`}>{status || 'PENDING'}</div>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">{p.paymentMethod || (isIncome ? 'Credit' : 'Payment')}</div>
                      <div className={`font-bold mt-1 ${isIncome ? 'text-green-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'} LKR {Math.abs(p.amount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}