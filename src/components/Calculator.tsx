import React, { useState, useEffect } from 'react';
import { RotateCcw, ArrowLeft, Share2, Download, ChevronDown, ChevronUp, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export function Calculator() {
  const [aov, setAov] = useState<number | ''>(35);
  const [currentSales, setCurrentSales] = useState<number | ''>(40);
  const [conversionRate, setConversionRate] = useState<number | ''>(2.0);
  const [numProducts, setNumProducts] = useState<number | ''>(25);
  const [targetRevenue, setTargetRevenue] = useState<number | ''>(6000);

  const [viewsPerDay, setViewsPerDay] = useState(2);
  const [successRate, setSuccessRate] = useState(0.20);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [cpc, setCpc] = useState<number | ''>(0.30);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [calculationState, setCalculationState] = useState<'invalid' | 'goal-met' | 'valid'>('valid');
  const [calculations, setCalculations] = useState({
    currentRevenue: 0,
    extraRevenue: 0,
    rankingsNeeded: 0,
    rankingsPerProduct: 0,
    extraViews: 0,
    extraOrders: 0,
    revenuePerRanking: 0,
    roas: 0,
    etsyAdsCost: 0,
    adCostPerRanking: 0
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('aov')) setAov(Number(params.get('aov')));
    if (params.get('currentSales')) setCurrentSales(Number(params.get('currentSales')));
    if (params.get('conversionRate')) setConversionRate(Number(params.get('conversionRate')));
    if (params.get('numProducts')) setNumProducts(Number(params.get('numProducts')));
    if (params.get('targetRevenue')) setTargetRevenue(Number(params.get('targetRevenue')));
    if (params.get('viewsPerDay')) setViewsPerDay(Number(params.get('viewsPerDay')));
    if (params.get('successRate')) setSuccessRate(Number(params.get('successRate')));
    if (params.get('daysPerMonth')) setDaysPerMonth(Number(params.get('daysPerMonth')));
    if (params.get('cpc')) setCpc(Number(params.get('cpc')));
  }, []);

  useEffect(() => {
    const aovNum = Number(aov) || 0;
    const conversionRateNum = Number(conversionRate) || 0;
    const currentSalesNum = Number(currentSales) || 0;
    const numProductsNum = Number(numProducts) || 0;
    const targetRevenueNum = Number(targetRevenue) || 0;

    if (aovNum <= 0 || conversionRateNum <= 0) {
      setCalculationState('invalid');
      return;
    }

    const currentRevenue = aovNum * currentSalesNum;

    if (targetRevenueNum <= currentRevenue) {
      setCalculationState('goal-met');
      setCalculations(prev => ({ ...prev, currentRevenue }));
      return;
    }

    setCalculationState('valid');

    const deltaRevenue = Math.max(0, targetRevenueNum - currentRevenue);
    const crDecimal = conversionRateNum / 100;
    const viewsPerRankingPerMonth = viewsPerDay * daysPerMonth;
    const revPerRanking = aovNum * (viewsPerRankingPerMonth * crDecimal);

    const rankingsNeeded = Math.ceil(deltaRevenue / revPerRanking);
    const perProduct = numProductsNum > 0 ? Math.ceil(rankingsNeeded / numProductsNum) : 0;
    const extraViews = rankingsNeeded * viewsPerRankingPerMonth;
    const extraOrders = Math.ceil(extraViews * crDecimal);

    const adEquivPerRanking = viewsPerRankingPerMonth * cpc;
    const adEquivTotal = extraViews * cpc;
    const revenueToAdsCost = adEquivTotal > 0 ? deltaRevenue / adEquivTotal : 0;

    setCalculations({
      currentRevenue,
      extraRevenue: deltaRevenue,
      rankingsNeeded,
      rankingsPerProduct: perProduct,
      extraViews: Math.ceil(extraViews),
      extraOrders,
      revenuePerRanking: revPerRanking,
      roas: revenueToAdsCost,
      etsyAdsCost: adEquivTotal,
      adCostPerRanking: adEquivPerRanking
    });
  }, [aov, currentSales, conversionRate, numProducts, targetRevenue, viewsPerDay, successRate, daysPerMonth, cpc]);

  const handleReset = () => {
    setAov(35);
    setCurrentSales(40);
    setConversionRate(2.0);
    setNumProducts(25);
    setTargetRevenue(6000);
    setViewsPerDay(2);
    setSuccessRate(0.20);
    setDaysPerMonth(30);
    setCpc(0.30);
    showToast('All fields have been reset', 'info');
  };

  const handleDemoData = () => {
    setAov(35);
    setCurrentSales(40);
    setConversionRate(2.0);
    setNumProducts(25);
    setTargetRevenue(6000);
    showToast('Demo data loaded', 'success');
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      aov: aov.toString(),
      currentSales: currentSales.toString(),
      conversionRate: conversionRate.toString(),
      numProducts: numProducts.toString(),
      targetRevenue: targetRevenue.toString(),
      viewsPerDay: viewsPerDay.toString(),
      successRate: successRate.toString(),
      daysPerMonth: daysPerMonth.toString(),
      cpc: cpc.toString()
    });

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleExportPDF = () => {
    showToast('PDF export coming soon', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#ff5702] mb-2">
            Rankings Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate how many rankings you need to hit your revenue goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#161618] p-8 rounded-2xl border border-[#ff5702]/10 lg:sticky lg:top-6 lg:self-start">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-[#ff5702] rounded"></div>
                  <h2 className="text-xl font-semibold text-white">Your Store Metrics</h2>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0B] border border-[#ff5702]/10 rounded-lg text-gray-300 hover:border-[#ff5702]/30 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Average Order Value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={aov}
                    onChange={(e) => setAov(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0A0A0B] border border-gray-700 rounded-lg px-4 pl-8 py-3 text-white focus:outline-none focus:border-[#ff5702] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Current Monthly Sales
                </label>
                <input
                  type="number"
                  value={currentSales}
                  onChange={(e) => setCurrentSales(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#0A0A0B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff5702] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Conversion Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0A0A0B] border border-gray-700 rounded-lg px-4 pr-10 py-3 text-white focus:outline-none focus:border-[#ff5702] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Number of Products
                </label>
                <input
                  type="number"
                  value={numProducts}
                  onChange={(e) => setNumProducts(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#0A0A0B] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff5702] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Cost Per Click (CPC) for Ads
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cpc}
                    onChange={(e) => setCpc(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#0A0A0B] border border-gray-700 rounded-lg px-4 pl-8 py-3 text-white focus:outline-none focus:border-[#ff5702] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="bg-gradient-to-br from-[#ff5702]/5 to-[#ff5702]/10 border border-[#ff5702]/20 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-[#ff5702] mb-3 uppercase tracking-wide">
                    Target Monthly Revenue
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">$</span>
                    <input
                      type="number"
                      value={targetRevenue}
                      onChange={(e) => setTargetRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-[#0A0A0B] border border-[#ff5702]/30 rounded-lg px-4 pl-9 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#ff5702] transition-colors"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-6">
            {calculationState === 'invalid' && (
              <div className="bg-[#161618] p-6 rounded-xl border border-yellow-500/20 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Invalid Input</h3>
                  <p className="text-gray-400">
                    Please ensure that Average Order Value and Conversion Rate are greater than zero.
                  </p>
                </div>
              </div>
            )}

            {calculationState === 'goal-met' && (
              <div className="bg-[#161618] p-6 rounded-xl border border-green-500/20 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Goal Already Met!</h3>
                  <p className="text-gray-400 mb-3">
                    Your current monthly revenue (${calculations.currentRevenue.toLocaleString()}) already meets or exceeds your target revenue (${Number(targetRevenue).toLocaleString()}).
                  </p>
                  <p className="text-sm text-gray-500">
                    Try setting a higher target to see how many rankings you need for additional growth.
                  </p>
                </div>
              </div>
            )}

            {calculationState === 'valid' && (
              <>
                <div className="bg-gradient-to-br from-[#161618] to-[#1a1a1c] p-8 rounded-2xl border border-[#ff5702]/20">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">Total Keywords Needed</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-[#ff5702]">
                        {calculations.rankingsNeeded}
                      </span>
                      <span className="text-2xl text-gray-300">rankings</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      Split these rankings across your top-selling listings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Extra Views/Mo</p>
                    <p className="text-3xl font-bold text-white">
                      {calculations.extraViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Extra Orders/Mo</p>
                    <p className="text-3xl font-bold text-white">
                      {calculations.extraOrders}
                    </p>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Revenue Per Keyword</p>
                    <p className="text-2xl font-bold text-[#ff5702]">
                      ${calculations.revenuePerRanking.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">monthly average</p>
                  </div>
                  <div className="bg-[#161618] p-6 rounded-xl border border-[#ff5702]/10">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Organic vs Ads (ROAS)</p>
                    <p className="text-2xl font-bold text-[#ff5702]">
                      {calculations.roas.toFixed(1)}×
                    </p>
                    <p className="text-xs text-gray-400 mt-1">better ROI</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#ff5702]/10 to-[#ff5702]/5 p-6 rounded-xl border border-[#ff5702]/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">If You Used Etsy Ads Instead</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-bold text-[#ff5702]">
                      ${calculations.etsyAdsCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-400">/month</span>

 </div>
                  
                </div>


                    

                <div className="bg-[#161618]/50 p-4 rounded-xl border border-[#ff5702]/10">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#ff5702]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-[#ff5702]">💡</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold text-white">Pro tip:</span> Focus your rankings on your best-selling products for faster results.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#161618] border border-[#ff5702]/20 rounded-lg p-4 shadow-xl animate-fade-in z-50">
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-500" />
            )}
            <p className="text-white text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
