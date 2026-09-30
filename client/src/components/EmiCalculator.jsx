import { useState } from "react";

const fmt = (n) => "Rs. " + Math.round(n).toLocaleString();

export default function EmiCalculator({ price }) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(15);

  const loan = price * (1 - downPct / 100);
  const n = years * 12;
  const r = rate / 12 / 100;

  const emi =
    r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - loan;

  const slider = (label, value, setValue, min, max, step, suffix) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-bold text-gray-800 mb-4">Mortgage calculator</h2>

      <div className="space-y-4">
        {slider("Down payment", downPct, setDownPct, 0, 90, 5, "%")}
        {slider("Interest rate (per year)", rate, setRate, 1, 30, 0.5, "%")}
        {slider("Loan term", years, setYears, 1, 30, 1, " yrs")}
      </div>

      <div className="mt-5 bg-emerald-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">Monthly EMI</p>
        <p className="text-2xl font-bold text-emerald-600">{fmt(emi)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-500">Loan amount</p>
          <p className="font-semibold text-gray-800">{fmt(loan)}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-500">Total interest</p>
          <p className="font-semibold text-gray-800">{fmt(interest)}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-500">Total payment</p>
          <p className="font-semibold text-gray-800">{fmt(total)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Estimate only. Actual rates and terms depend on your bank.
      </p>
    </div>
  );
}