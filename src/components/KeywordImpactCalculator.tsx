import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export function KeywordImpactCalculator() {
  const [aSearches, setASearches] = useState(100000);
  const [aCtr, setACtr] = useState(1);
  const [aConv, setAConv] = useState(1);
  const [bSearches, setBSearches] = useState(1000000);
  const [bCtr, setBCtr] = useState(5);
  const [bConv, setBConv] = useState(2.5);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const AOV = 35;

  const fmt = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return n.toLocaleString();
  };

  const fmtMoney = (n: number): string => {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return '$' + n.toLocaleString();
    return '$' + n.toFixed(0);
  };

  const aClicks = Math.round(aSearches * aCtr / 100);
  const aSales = Math.round(aClicks * aConv / 100);
  const aRev = aSales * AOV;

  const bClicks = Math.round(bSearches * bCtr / 100);
  const bSales = Math.round(bClicks * bConv / 100);
  const bRev = bSales * AOV;

  const maxS = Math.max(aSearches, bSearches);
  const mult = aSales > 0 ? (bSales / aSales) : 0;
  const multText = mult >= 1 ? Math.round(mult) + '×' : (mult > 0 ? mult.toFixed(1) + '×' : '∞');

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#e0e0e0] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={navigateHome}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            <span className="text-[#f97316]">Volume × Relevance × Conversion</span> = Sales
          </h1>
          <p className="text-gray-500 text-sm">Ranking is just the start. How relevant your keyword is and how well your listing converts — that's where the real gap opens up.</p>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Control Group */}
          <div className="bg-[#12141c] border border-[#1e2130] rounded-2xl p-6">
            <div className="text-xs uppercase tracking-widest text-gray-600 mb-4 font-semibold">Without eRanker</div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Searches/mo</label>
                  <span className="text-lg font-bold text-gray-400">{fmt(aSearches)}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="2000000"
                  step="10000"
                  value={aSearches}
                  onChange={(e) => setASearches(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1">
                    CTR
                    <div
                      className="relative inline-block"
                      onMouseEnter={() => setShowTooltip('ctr')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 cursor-help hover:border-[#f97316] hover:text-[#f97316]">i</div>
                      {showTooltip === 'ctr' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1d27] border border-gray-700 rounded-lg p-3 w-64 text-xs text-gray-400 z-50 shadow-lg">
                          <p className="font-semibold text-white mb-1">Keyword-level CTR</p>
                          <p>Each keyword has its own CTR — not just your listing overall. Find it in <strong>Etsy Ads → Listing → Detailed Stats</strong>. A high-relevance keyword gets a higher CTR because the search intent matches your product.</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <span className="text-lg font-bold text-gray-400">{aCtr.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15"
                  step="0.1"
                  value={aCtr}
                  onChange={(e) => setACtr(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Conv. rate</label>
                  <span className="text-lg font-bold text-gray-400">{aConv.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={aConv}
                  onChange={(e) => setAConv(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Right Control Group */}
          <div className="bg-[#12141c] border border-[#f97316]/20 rounded-2xl p-6">
            <div className="text-xs uppercase tracking-widest text-[#f97316] mb-4 font-semibold">With eRanker</div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Searches/mo</label>
                  <span className="text-lg font-bold text-[#f97316]">{fmt(bSearches)}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="5000000"
                  step="10000"
                  value={bSearches}
                  onChange={(e) => setBSearches(Number(e.target.value))}
                  className="w-full h-1 bg-orange-900 rounded-lg appearance-none cursor-pointer accent-[#f97316]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1">
                    CTR
                    <div
                      className="relative inline-block"
                      onMouseEnter={() => setShowTooltip('ctr2')}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 cursor-help hover:border-[#f97316] hover:text-[#f97316]">i</div>
                      {showTooltip === 'ctr2' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1d27] border border-gray-700 rounded-lg p-3 w-64 text-xs text-gray-400 z-50 shadow-lg">
                          <p className="font-semibold text-white mb-1">Keyword-level CTR</p>
                          <p>Each keyword has its own CTR — not just your listing overall. Find it in <strong>Etsy Ads → Listing → Detailed Stats</strong>. A high-relevance keyword gets a higher CTR because the search intent matches your product.</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <span className="text-lg font-bold text-[#f97316]">{bCtr.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={bCtr}
                  onChange={(e) => setBCtr(Number(e.target.value))}
                  className="w-full h-1 bg-orange-900 rounded-lg appearance-none cursor-pointer accent-[#f97316]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Conv. rate</label>
                  <span className="text-lg font-bold text-[#f97316]">{bConv.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15"
                  step="0.1"
                  value={bConv}
                  onChange={(e) => setBConv(Number(e.target.value))}
                  className="w-full h-1 bg-orange-900 rounded-lg appearance-none cursor-pointer accent-[#f97316]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Funnels */}
        <div className="grid md:grid-cols-3 gap-8 mb-8 items-start">
          {/* Left Funnel */}
          <div>
            <div className="mb-2">
              <div className="h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-1" style={{ width: `${Math.max(20, (aSearches / maxS) * 90)}%` }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500">{fmt(aSearches)}</div>
                  <div className="text-xs uppercase text-gray-600">searches / mo</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 mb-2">↓ {aCtr.toFixed(1)}% CTR</div>
            <div className="mb-2">
              <div className="h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-1" style={{ width: `${Math.max(14, (aClicks / maxS) * 2000)}%` }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500">{aClicks.toLocaleString()}</div>
                  <div className="text-xs uppercase text-gray-600">clicks</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 mb-2">↓ {aConv.toFixed(1)}% conv.</div>
            <div className="mb-6">
              <div className="h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-1" style={{ width: `${Math.max(10, (aSales / Math.max(aSales, bSales)) * 60)}%` }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500">{aSales.toLocaleString()}</div>
                  <div className="text-xs uppercase text-gray-600">sales</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gray-600 mb-1">{aSales.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mb-2">sales / month</div>
              <div className="text-xl font-bold text-yellow-600 mb-1">{fmtMoney(aRev)}/mo</div>
              <div className="text-xs text-gray-600">at $35 AOV</div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center justify-start py-8">
            <div className="w-0.5 h-24 bg-gradient-to-b from-gray-700 to-transparent mb-4"></div>
            <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)' }}>
              <div className="text-2xl font-black text-white">{multText}</div>
            </div>
            <div className="w-0.5 h-24 bg-gradient-to-t from-gray-700 to-transparent"></div>
          </div>

          {/* Right Funnel */}
          <div>
            <div className="mb-2">
              <div className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-1" style={{ width: `${Math.max(20, (bSearches / maxS) * 90)}%` }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{fmt(bSearches)}</div>
                  <div className="text-xs uppercase text-gray-200">searches / mo</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-400 mb-2">↓ {bCtr.toFixed(1)}% CTR</div>
            <div className="mb-2">
              <div className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-1" style={{ width: `${Math.max(14, (bClicks / maxS) * 2000)}%` }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{bClicks.toLocaleString()}</div>
                  <div className="text-xs uppercase text-gray-200">clicks</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-400 mb-2">↓ {bConv.toFixed(1)}% conv.</div>
            <div className="mb-6">
              <div className="h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg flex items-center justify-center mb-1" style={{ width: `${Math.max(10, (bSales / Math.max(aSales, bSales)) * 60)}%` }}>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{bSales.toLocaleString()}</div>
                  <div className="text-xs uppercase text-gray-200">sales</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-[#f97316] mb-1">{bSales.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mb-2">sales / month</div>
              <div className="text-xl font-bold text-yellow-500 mb-1">{fmtMoney(bRev)}/mo</div>
              <div className="text-xs text-gray-600">at $35 AOV</div>
            </div>
          </div>
        </div>

        {/* Takeaway */}
        <div className="border-t border-gray-700 pt-6 mt-8 text-center">
          <p className="text-lg text-gray-400 font-medium">
            Ranking on the right keyword isn't a <strong className="text-white">small improvement</strong> — it's a <span className="text-[#f97316] font-bold">{multText} difference</span> in revenue.
          </p>
        </div>
      </div>
    </div>
  );
}
