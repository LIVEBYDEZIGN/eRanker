import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export function KeywordImpactCalculator() {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      const AOV = 35;

      const els = {
        aSearches: document.getElementById('a-searches'),
        aCtr: document.getElementById('a-ctr'),
        aConv: document.getElementById('a-conv'),
        bSearches: document.getElementById('b-searches'),
        bCtr: document.getElementById('b-ctr'),
        bConv: document.getElementById('b-conv'),
      };

      function fmt(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
        return n.toLocaleString();
      }

      function fmtMoney(n) {
        if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
        if (n >= 1000) return '$' + n.toLocaleString();
        return '$' + n.toFixed(0);
      }

      function update() {
        const aS = parseFloat(els.aSearches.value);
        const aCtr = parseFloat(els.aCtr.value);
        const aConv = parseFloat(els.aConv.value);
        const bS = parseFloat(els.bSearches.value);
        const bCtr = parseFloat(els.bCtr.value);
        const bConv = parseFloat(els.bConv.value);

        const aClicks = Math.round(aS * aCtr / 100);
        const aSales = Math.round(aClicks * aConv / 100);
        const aRev = aSales * AOV;

        const bClicks = Math.round(bS * bCtr / 100);
        const bSales = Math.round(bClicks * bConv / 100);
        const bRev = bSales * AOV;

        // Slider display values
        document.getElementById('a-searches-val').textContent = fmt(aS);
        document.getElementById('a-ctr-val').textContent = aCtr.toFixed(1) + '%';
        document.getElementById('a-conv-val').textContent = aConv.toFixed(1) + '%';
        document.getElementById('b-searches-val').textContent = fmt(bS);
        document.getElementById('b-ctr-val').textContent = bCtr.toFixed(1) + '%';
        document.getElementById('b-conv-val').textContent = bConv.toFixed(1) + '%';

        // Funnel labels
        document.getElementById('a-ctr-label').textContent = aCtr.toFixed(1) + '% CTR';
        document.getElementById('a-conv-label').textContent = aConv.toFixed(1) + '% conv.';
        document.getElementById('b-ctr-label').textContent = bCtr.toFixed(1) + '% CTR';
        document.getElementById('b-conv-label').textContent = bConv.toFixed(1) + '% conv.';

        // Funnel numbers
        document.getElementById('a-num1').textContent = fmt(aS);
        document.getElementById('a-num2').textContent = aClicks.toLocaleString();
        document.getElementById('a-num3').textContent = aSales.toLocaleString();
        document.getElementById('b-num1').textContent = fmt(bS);
        document.getElementById('b-num2').textContent = bClicks.toLocaleString();
        document.getElementById('b-num3').textContent = bSales.toLocaleString();

        // Funnel bar widths (proportional narrowing)
        const maxS = Math.max(aS, bS);
        document.getElementById('a-bar1').style.width = Math.max(20, (aS / maxS) * 90) + '%';
        document.getElementById('a-bar2').style.width = Math.max(14, (aClicks / maxS) * 2000) + '%';
        document.getElementById('a-bar3').style.width = Math.max(10, (aSales / Math.max(aSales, bSales)) * 60) + '%';
        document.getElementById('b-bar1').style.width = Math.max(20, (bS / maxS) * 90) + '%';
        document.getElementById('b-bar2').style.width = Math.max(14, (bClicks / maxS) * 2000) + '%';
        document.getElementById('b-bar3').style.width = Math.max(10, (bSales / Math.max(aSales, bSales)) * 60) + '%';

        // Results
        document.getElementById('a-sales').textContent = aSales.toLocaleString();
        document.getElementById('a-revenue').textContent = fmtMoney(aRev) + '/mo';
        document.getElementById('b-sales').textContent = bSales.toLocaleString();
        document.getElementById('b-revenue').textContent = fmtMoney(bRev) + '/mo';

        // Multiplier
        const mult = aSales > 0 ? (bSales / aSales) : 0;
        const multText = mult >= 1 ? Math.round(mult) + '×' : (mult > 0 ? mult.toFixed(1) + '×' : '∞');
        document.getElementById('multiplier').textContent = multText;

        // Takeaway
        document.getElementById('takeaway-text').innerHTML =
          'Ranking on the right keyword isn\\'t a <strong>small improvement</strong> — it\\'s a <span class="orange">' +
          multText + ' difference</span> in revenue.';
      }

      // Bind all sliders
      Object.values(els).forEach(el => el.addEventListener('input', update));

      // Initial render
      update();
    `;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0b10', color: '#e0e0e0' }}>
      <div style={{ width: '1200px', maxWidth: '96vw', margin: '0 auto', padding: '40px 56px' }}>
        <button
          onClick={navigateHome}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0b10;
            color: #e0e0e0;
            overflow: hidden;
          }
          .slide {
            width: 1200px;
            max-width: 96vw;
            padding: 40px 56px;
          }
          .header { text-align: center; margin-bottom: 32px; }
          .header h1 { font-size: 30px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
          .header h1 span { color: #f97316; }
          .header p { font-size: 14px; color: #666; margin-top: 4px; }

          /* Controls */
          .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .ctrl-group {
            background: #12141c;
            border-radius: 12px;
            padding: 16px 20px;
            border: 1px solid #1e2130;
          }
          .ctrl-group.right { border-color: #f9731630; }
          .ctrl-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #555;
            margin-bottom: 12px;
          }
          .ctrl-group.right .ctrl-title { color: #f97316; }
          .ctrl-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
          }
          .ctrl-row:last-child { margin-bottom: 0; }
          .ctrl-row label {
            font-size: 12px;
            color: #888;
            width: 100px;
            flex-shrink: 0;
          }
          .ctrl-row input[type="range"] {
            flex: 1;
            -webkit-appearance: none;
            height: 4px;
            border-radius: 2px;
            outline: none;
            cursor: pointer;
          }
          .ctrl-group.left input[type="range"] { background: #1e293b; }
          .ctrl-group.left input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
            background: #4a5068; cursor: pointer;
          }
          .ctrl-group.right input[type="range"] { background: #2a1a0a; }
          .ctrl-group.right input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
            background: #f97316; cursor: pointer;
          }
          .ctrl-row .val {
            font-size: 14px;
            font-weight: 700;
            width: 80px;
            text-align: right;
            flex-shrink: 0;
          }
          .ctrl-group.left .val { color: #4a5068; }
          .ctrl-group.right .val { color: #f97316; }

          /* Columns */
          .columns {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
          }
          .funnel {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .funnel-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            margin-bottom: 4px;
          }
          .f-bar {
            height: 48px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            transition: width 0.3s ease;
          }
          .f-bar .num { font-size: 17px; font-weight: 800; line-height: 1.1; }
          .f-bar .desc { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
          .f-arrow { text-align: center; color: #333; font-size: 12px; margin: 2px 0; }
          .f-arrow span { font-size: 10px; color: #555; margin-left: 4px; }

          .funnel.left .f-bar { background: #151823; color: #4a5068; }
          .funnel.right .f-bar { color: #fff; }
          .funnel.right .s1 { background: linear-gradient(135deg, #6d28d9, #7c3aed); }
          .funnel.right .s2 { background: linear-gradient(135deg, #2563eb, #3b82f6); }
          .funnel.right .s3 { background: linear-gradient(135deg, #ea580c, #f97316); }

          .result { text-align: center; margin-top: 20px; }
          .result .big-num { font-size: 56px; font-weight: 900; line-height: 1; transition: all 0.3s; }
          .funnel.left .big-num { color: #2a2f42; }
          .funnel.right .big-num { color: #f97316; }
          .result .unit { font-size: 13px; color: #666; margin-top: 2px; }
          .result .revenue { font-size: 18px; font-weight: 700; margin-top: 6px; transition: all 0.3s; }
          .funnel.left .revenue { color: #3a4060; }
          .funnel.right .revenue { color: #fbbf24; }
          .result .rev-label { font-size: 10px; color: #555; }

          .divider {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0 28px;
          }
          .divider-line { width: 1px; height: 80px; background: linear-gradient(to bottom, transparent, #333, transparent); }
          .vs-badge {
            background: #f97316;
            color: #fff;
            font-size: 24px;
            font-weight: 900;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 12px 0;
            box-shadow: 0 0 40px #f9731640;
            transition: all 0.3s;
          }

          .takeaway {
            text-align: center;
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid #1a1d27;
          }
          .takeaway p { font-size: 17px; color: #888; font-weight: 500; transition: all 0.3s; }
          .takeaway p strong { color: #fff; font-weight: 700; }
          .takeaway p .orange { color: #f97316; font-weight: 800; }

          /* Info tooltip */
          .info-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            border: 1px solid #444;
            font-size: 10px;
            font-weight: 700;
            color: #666;
            cursor: pointer;
            margin-left: 4px;
            position: relative;
            flex-shrink: 0;
            font-style: italic;
            font-family: Georgia, serif;
            line-height: 1;
          }
          .info-icon:hover { border-color: #f97316; color: #f97316; }
          .info-tooltip {
            display: none;
            position: absolute;
            bottom: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: 280px;
            background: #1a1d27;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 14px 16px;
            font-size: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-style: normal;
            font-weight: 400;
            color: #bbb;
            line-height: 1.6;
            z-index: 100;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            pointer-events: none;
          }
          .info-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: #333;
          }
          .info-icon:hover .info-tooltip { display: block; }
          .info-tooltip strong { color: #f97316; font-weight: 600; }
          .info-tooltip .tip-label { color: #fff; font-weight: 600; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        `}</style>

        <div className="slide">
          <div className="header">
            <h1><span>Volume × Relevance × Conversion</span> = Sales</h1>
            <p>Ranking is just the start. How relevant your keyword is and how well your listing converts — that's where the real gap opens up.</p>
          </div>

          <div className="controls">
            <div className="ctrl-group left">
              <div className="ctrl-title">Without eRanker</div>
              <div className="ctrl-row">
                <label>Searches/mo</label>
                <input type="range" id="a-searches" min="10000" max="2000000" step="10000" defaultValue="100000" />
                <span className="val" id="a-searches-val">100K</span>
              </div>
              <div className="ctrl-row">
                <label>CTR <span className="info-icon">i<span className="info-tooltip"><span className="tip-label">Keyword-level CTR</span>Each keyword has its own CTR — not just your listing overall. Find it in <strong>Etsy Ads → Listing → Detailed Stats</strong>. A high-relevance keyword gets a higher CTR because the search intent matches your product.</span></span></label>
                <input type="range" id="a-ctr" min="0.1" max="15" step="0.1" defaultValue="1" />
                <span className="val" id="a-ctr-val">1%</span>
              </div>
              <div className="ctrl-row">
                <label>Conv. rate</label>
                <input type="range" id="a-conv" min="0.1" max="10" step="0.1" defaultValue="1" />
                <span className="val" id="a-conv-val">1%</span>
              </div>
            </div>
            <div className="ctrl-group right">
              <div className="ctrl-title">With eRanker</div>
              <div className="ctrl-row">
                <label>Searches/mo</label>
                <input type="range" id="b-searches" min="10000" max="5000000" step="10000" defaultValue="1000000" />
                <span className="val" id="b-searches-val">1M</span>
              </div>
              <div className="ctrl-row">
                <label>CTR <span className="info-icon">i<span className="info-tooltip"><span className="tip-label">Keyword-level CTR</span>Each keyword has its own CTR — not just your listing overall. Find it in <strong>Etsy Ads → Listing → Detailed Stats</strong>. A high-relevance keyword gets a higher CTR because the search intent matches your product.</span></span></label>
                <input type="range" id="b-ctr" min="0.1" max="20" step="0.1" defaultValue="5" />
                <span className="val" id="b-ctr-val">5%</span>
              </div>
              <div className="ctrl-row">
                <label>Conv. rate</label>
                <input type="range" id="b-conv" min="0.1" max="15" step="0.1" defaultValue="2.5" />
                <span className="val" id="b-conv-val">2.5%</span>
              </div>
            </div>
          </div>

          <div className="columns">
            <div className="funnel left">
              <div className="funnel-step"><div className="f-bar s1" id="a-bar1" style={{width:'90%'}}><div className="num" id="a-num1">100K</div><div className="desc">searches / mo</div></div></div>
              <div className="f-arrow">↓ <span id="a-ctr-label">1% CTR</span></div>
              <div className="funnel-step"><div className="f-bar s2" id="a-bar2" style={{width:'45%'}}><div className="num" id="a-num2">1,000</div><div className="desc">clicks</div></div></div>
              <div className="f-arrow">↓ <span id="a-conv-label">1% conv.</span></div>
              <div className="funnel-step"><div className="f-bar s3" id="a-bar3" style={{width:'14%'}}><div className="num" id="a-num3">10</div><div className="desc">sales</div></div></div>
              <div className="result">
                <div className="big-num" id="a-sales">10</div>
                <div className="unit">sales / month</div>
                <div className="revenue" id="a-revenue">$350/mo</div>
                <div className="rev-label">at $35 AOV</div>
              </div>
            </div>

            <div className="divider">
              <div className="divider-line"></div>
              <div className="vs-badge" id="multiplier">125×</div>
              <div className="divider-line"></div>
            </div>

            <div className="funnel right">
              <div className="funnel-step"><div className="f-bar s1" id="b-bar1" style={{width:'100%'}}><div className="num" id="b-num1">1,000,000</div><div className="desc">searches / mo</div></div></div>
              <div className="f-arrow">↓ <span id="b-ctr-label">5% CTR</span></div>
              <div className="funnel-step"><div className="f-bar s2" id="b-bar2" style={{width:'65%'}}><div className="num" id="b-num2">50,000</div><div className="desc">clicks</div></div></div>
              <div className="f-arrow">↓ <span id="b-conv-label">2.5% conv.</span></div>
              <div className="funnel-step"><div className="f-bar s3" id="b-bar3" style={{width:'30%'}}><div className="num" id="b-num3">1,250</div><div className="desc">sales</div></div></div>
              <div className="result">
                <div className="big-num" id="b-sales">1,250</div>
                <div className="unit">sales / month</div>
                <div className="revenue" id="b-revenue">$43,750/mo</div>
                <div className="rev-label">at $35 AOV</div>
              </div>
            </div>
          </div>

          <div className="takeaway">
            <p id="takeaway-text">Ranking on the right keyword isn't a <strong>small improvement</strong> — it's a <span className="orange">125× difference</span> in revenue.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
