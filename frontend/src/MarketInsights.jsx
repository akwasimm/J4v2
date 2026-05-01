import { useState, useEffect } from "react";
import { fetchMarketInsightsDB, fetchSupportedCurrencies } from "./services/insightsService.js";
import { useNavigate } from "react-router-dom";

const NEO = { boxShadow: "4px 4px 0px 0px #000000" };
const NEO_SM = { boxShadow: "2px 2px 0px 0px #000000" };
const NEO_WHITE = { boxShadow: "4px 4px 0px 0px rgba(255,255,255,1)" };
const NEO_WHITE_SM = { boxShadow: "2px 2px 0px 0px rgba(255,255,255,1)" };
const BORDER = "border-2 border-black";

const ROLE_OPTIONS = [
  "Senior Product Designer",
  "Full Stack Developer", 
  "Marketing Manager",
  "Data Scientist",
  "UX Researcher",
  "DevOps Engineer",
  "Product Manager",
  "Software Architect"
];

const LOCATION_OPTIONS = [
  "Global (Remote)",
  "New York, USA",
  "London, UK",
  "Singapore",
  "San Francisco, USA",
  "Berlin, Germany",
  "Toronto, Canada",
  "Sydney, Australia",
  "Dubai, UAE",
  "Bangalore, India",
  "Mumbai, India",
  "Delhi, India",
  "Hyderabad, India",
  "Chennai, India",
  "Pune, India"
];

const SKILLS = [
  { label: "UI/UX Strategy", width: "90%", badgeBg: "bg-[#1A4D2E]", badgeText: "text-white", badge: "YOU HAVE", barBg: "bg-[#1A4D2E]" },
  { label: "React & Next.js", width: "45%", badgeBg: "bg-[#FACC15]", badgeText: "text-black", badge: "LEARNING", barBg: "bg-[#FACC15]" },
  { label: "Python / AI Modeling", width: "0%", badgeBg: "bg-white", badgeText: "text-black", badge: "MISSING", barBg: "bg-white" },
  { label: "Team Leadership", width: "75%", badgeBg: "bg-[#1A4D2E]", badgeText: "text-white", badge: "YOU HAVE", barBg: "bg-[#1A4D2E]" },
];

const COMPANIES = [
  { name: "TechStream Inc.", roles: 14, iconBg: "bg-black", iconColor: "text-white", icon: "bolt" },
  { name: "CloudSphere", roles: 8, iconBg: "bg-[#D8B4FE] border border-black", iconColor: "text-black", icon: "cloud_queue" },
  { name: "GreenLogic", roles: 22, iconBg: "bg-[#1A4D2E]", iconColor: "text-white", icon: "eco" },
  { name: "DesignHaus", roles: 5, iconBg: "bg-[#FACC15] border border-black", iconColor: "text-black", icon: "architecture" },
];

const EXP_LEVELS = [
  { label: "Entry", height: "20%", bg: "bg-[#D8B4FE]" },
  { label: "Junior", height: "45%", bg: "bg-[#D8B4FE]" },
  { label: "Mid-Level", height: "85%", bg: "bg-[#1A4D2E]" },
  { label: "Senior", height: "60%", bg: "bg-[#D8B4FE]" },
  { label: "Lead+", height: "30%", bg: "bg-[#D8B4FE]" },
];

const GEO_LEFT = [
  { country: "United States", pct: "42%", highlight: true },
  { country: "United Kingdom", pct: "18%" },
  { country: "Germany", pct: "12%" },
];
const GEO_RIGHT = [
  { country: "Canada", pct: "10%" },
  { country: "Singapore", pct: "9%" },
  { country: "Others", pct: "9%" },
];

const CHART_LABELS = ["2021", "Q2", "Q4", "2022", "Q2", "Q4", "2023", "Q2", "PRESENT"];

export default function MarketInsights() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Market Insights — JobFor";
  }, []);

  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);

  // Live Data State
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInr, setShowInr] = useState(false);  // Currency toggle
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Use database endpoint (fast, no AI API calls)
      const loc = location === "Global (Remote)" ? "Global (Remote)" : location;
      const response = await fetchMarketInsightsDB(role, loc, showInr);
      
      // Response structure: { user_id, role, location, data: {...}, source: "database" }
      const insights = response?.data || response;
      setMarketData(insights);
      
      // Update currency symbol based on display currency
      const displayCurrency = insights?.display_currency || (showInr ? "INR" : "USD");
      setCurrencySymbol(displayCurrency === "INR" ? "₹" : displayCurrency === "GBP" ? "£" : displayCurrency === "EUR" ? "€" : "$");
      
    } catch (e) {
      console.error("Failed to load insights:", e);
      // If DB data not found, show error message
      if (e.message?.includes("404") || e.message?.includes("not found")) {
        console.error("Market data not found for this role+location combination. Run the population script.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Only load on initial mount and when currency toggle changes
  useEffect(() => {
    // Load once on mount
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Re-load when currency toggle changes (same data, different display)
  useEffect(() => {
    if (marketData) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInr]);


  return (
    <div className="bg-[#F9FAFB] text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      {/* MAIN */}
      <main className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">

        {/* Page Header + Filters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              MARKET <span className="text-[#1A4D2E] italic">INSIGHTS</span>
            </h1>
            <p className="text-gray-600 font-medium">
              Pre-populated market data from database.
              {marketData?.inr_available && (
                <span className="ml-2 text-xs bg-[#D8B4FE] px-2 py-0.5 border border-black">INR Toggle Available</span>
              )}
              <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 border border-black text-green-800">From DB</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <FilterSelect label="Role Type" value={role} onChange={setRole} options={ROLE_OPTIONS} />
            <FilterSelect label="Location" value={location} onChange={setLocation} options={LOCATION_OPTIONS} />
            
            {/* Currency Toggle */}
            {marketData?.inr_available && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider">Currency</label>
                <button
                  onClick={() => setShowInr(!showInr)}
                  className={`px-4 py-3 font-bold border-2 border-black transition-all ${showInr ? 'bg-[#1A4D2E] text-white' : 'bg-white text-black'}`}
                  style={NEO_SM}
                >
                  {showInr ? "₹ INR" : `${currencySymbol} Local`}
                </button>
              </div>
            )}
            
            <div className="flex items-end">
              <button
                className="bg-[#1A4D2E] text-white px-8 py-3 font-bold border-2 border-black transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
                style={NEO_SM}
                onClick={loadInsights}
              >
                {loading ? "..." : "REFRESH"}
              </button>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

          {/* Salary Insights */}
          <div className={`lg:col-span-5 bg-white ${BORDER} p-6 relative overflow-hidden`} style={NEO}>
            <div className="absolute top-0 right-0 bg-[#D8B4FE] px-4 py-1 border-b-2 border-l-2 border-black font-bold text-xs uppercase">Live Data</div>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span className="material-symbols-outlined text-[#1A4D2E]">payments</span> Salary Insights
            </h3>
            <div className="space-y-8 py-2">
              {/* Range bar */}
              <div className="relative pt-6">
                <div className={`h-4 w-full bg-gray-100 ${BORDER} overflow-hidden flex`}>
                  <div className="h-full bg-[#1A4D2E]/20 w-1/4"></div>
                  <div className="h-full bg-[#1A4D2E]/40 w-1/2"></div>
                  <div className="h-full bg-[#1A4D2E]/20 w-1/4"></div>
                </div>
                <div className="flex justify-between mt-4 text-sm font-bold">
                  <div><span className="block text-gray-400">MIN</span><span>{currencySymbol}{marketData?.metrics ? Math.floor(marketData.metrics.min/1000) : 85}k</span></div>
                  <div className="text-center"><span className="block text-gray-400">MEDIAN</span><span>{currencySymbol}{marketData?.metrics ? Math.floor(marketData.metrics.median/1000) : 124}k</span></div>
                  <div className="text-right"><span className="block text-gray-400">MAX</span><span>{currencySymbol}{marketData?.metrics ? Math.floor(marketData.metrics.max/1000) : 192}k</span></div>
                </div>
                <div className="absolute -top-4 left-[65%] -translate-x-1/2 flex flex-col items-center">
                  <div className={`bg-[#D8B4FE] ${BORDER} px-3 py-1 font-bold text-sm whitespace-nowrap mb-1`} style={NEO_SM}>
                    Your Estimate: {currencySymbol}{marketData?.metrics ? Math.floor(marketData.metrics.median/1000) : 145}k
                  </div>
                  <div className="w-1 h-12 bg-black"></div>
                </div>
              </div>
              {/* Percentile */}
              <div className={`bg-[#1A4D2E] text-white p-4 ${BORDER} flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-bold text-[#D8B4FE] uppercase">Percentile Rank</p>
                  <p className="text-xl font-bold">Top 15% in Location</p>
                </div>
                <span className="material-symbols-outlined text-4xl">trending_up</span>
              </div>
            </div>
          </div>

          {/* Market Overview */}
          <div className={`lg:col-span-3 bg-[#D8B4FE] ${BORDER} p-6 flex flex-col justify-between`} style={NEO}>
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Market Overview</h3>
              <p className="text-sm font-medium mb-4">High activity detected in your sector.</p>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-4xl font-black block">{marketData?.trend ? "+"+marketData.trend.growth_percentage?.toFixed(1) : "+12"}%</span>
                <span className="font-bold text-[#1A4D2E] uppercase text-sm">Growth (MoM)</span>
              </div>
              <div className="h-px bg-black/20"></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-2xl font-bold block">{marketData?.trend?.active_listings || "1.2k"}</span>
                  <span className="text-xs font-bold text-gray-700 uppercase">New Postings</span>
                </div>
                <div>
                  <span className="text-2xl font-bold block">{marketData?.trend?.avg_time_to_hire || 24}d</span>
                  <span className="text-xs font-bold text-gray-700 uppercase">Avg. Time to Hire</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Skills - Dynamic from API */}
          <div className={`lg:col-span-4 bg-white ${BORDER} p-6`} style={NEO}>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Top In-Demand Skills</h3>
            <div className="space-y-4">
              {(marketData?.skills_in_demand?.length > 0 ? marketData.skills_in_demand : SKILLS).slice(0, 6).map((skill, index) => {
                const label = skill.skill || skill.label;
                const width = skill.demand_score ? `${skill.demand_score * 100}%` : skill.width;
                const trend = skill.trend || "stable";
                const isRising = trend === "rising";
                const badgeBg = isRising ? "bg-[#1A4D2E]" : "bg-[#FACC15]";
                const badgeText = isRising ? "text-white" : "text-black";
                const badge = isRising ? "TRENDING ↑" : "STABLE";
                
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-bold">{label}</span>
                      <span className={`text-xs font-bold ${badgeBg} ${badgeText} px-2 border border-black`}>{badge}</span>
                    </div>
                    <div className={`h-4 w-full ${BORDER} bg-gray-100`}>
                      <div className={`h-full ${badgeBg}`} style={{ width }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              className="w-full mt-8 font-bold text-sm underline hover:text-[#1A4D2E] decoration-2"
              onClick={() => navigate('/skillgap')}
            >
              EXPLORE LEARNING PATHS
            </button>
          </div>

          {/* Salary Trends Chart - Dynamic from API */}
          <div className={`lg:col-span-8 bg-white ${BORDER} p-6 min-h-[300px] flex flex-col justify-between`} style={NEO}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Salary Trends (3 Years)</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 bg-[#1A4D2E] ${BORDER}`}></span>
                  <span className="text-xs font-bold">{marketData?.display_currency || 'USD'}</span>
                </div>
                {marketData?.inr_available && (
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 bg-[#D8B4FE] ${BORDER}`}></span>
                    <span className="text-xs font-bold">INR</span>
                  </div>
                )}
              </div>
            </div>
            <div className="relative h-48 flex items-end border-b-2 border-l-2 border-black px-4 mb-6">
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Dynamic salary trend lines */}
                  {marketData?.salary_trends?.length > 0 ? (
                    <>
                      {/* Primary currency trend */}
                      <polyline
                        fill="none"
                        stroke="#1A4D2E"
                        strokeWidth="4"
                        points={marketData.salary_trends.map((t, i) => {
                          const x = (i / (marketData.salary_trends.length - 1)) * 800;
                          const maxSalary = Math.max(...marketData.salary_trends.map(s => s.median_salary));
                          const minSalary = Math.min(...marketData.salary_trends.map(s => s.median_salary));
                          const range = maxSalary - minSalary || 1;
                          const y = 200 - ((t.median_salary - minSalary) / range) * 150 - 25;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      {/* INR trend (if available) */}
                      {marketData.inr_available && marketData.salary_trends[0]?.median_salary_inr && (
                        <polyline
                          fill="none"
                          stroke="#D8B4FE"
                          strokeDasharray="8,4"
                          strokeWidth="4"
                          points={marketData.salary_trends.map((t, i) => {
                            const x = (i / (marketData.salary_trends.length - 1)) * 800;
                            const maxSalary = Math.max(...marketData.salary_trends.map(s => s.median_salary_inr || s.median_salary));
                            const minSalary = Math.min(...marketData.salary_trends.map(s => s.median_salary_inr || s.median_salary));
                            const range = maxSalary - minSalary || 1;
                            const y = 200 - ((t.median_salary_inr - minSalary) / range) * 150 - 25;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <path d="M0,180 L100,160 L200,170 L300,120 L400,140 L500,80 L600,90 L700,40 L800,50" fill="none" stroke="#1A4D2E" strokeWidth="4" />
                      <path d="M0,150 L100,140 L200,130 L300,110 L400,100 L500,90 L600,70 L700,60 L800,40" fill="none" stroke="#D8B4FE" strokeDasharray="8,4" strokeWidth="4" />
                    </>
                  )}
                </svg>
              </div>
              <div className="absolute -bottom-6 left-0 flex justify-between w-full text-xs font-bold px-4">
                {marketData?.salary_trends?.map((t) => (
                  <span key={t.period}>{t.period}</span>
                )) || CHART_LABELS.map((l) => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>

          {/* Top Hiring Companies - Dynamic from API */}
          <div className={`lg:col-span-4 bg-white ${BORDER} p-6`} style={NEO}>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Top Hiring Companies</h3>
            <div className="space-y-3">
              {(marketData?.top_hiring_companies?.length > 0 ? marketData.top_hiring_companies : COMPANIES).slice(0, 6).map((c, i) => {
                const name = c.company_name || c.name;
                const roles = c.active_openings || c.roles || Math.floor(Math.random() * 50) + 5;
                const hiringVelocity = c.hiring_velocity || "moderate";
                const colors = [
                  { iconBg: "bg-black", iconColor: "text-white", icon: "bolt" },
                  { iconBg: "bg-[#D8B4FE] border border-black", iconColor: "text-black", icon: "cloud_queue" },
                  { iconBg: "bg-[#1A4D2E]", iconColor: "text-white", icon: "eco" },
                  { iconBg: "bg-[#FACC15] border border-black", iconColor: "text-black", icon: "architecture" },
                  { iconBg: "bg-[#FCA5A5] border border-black", iconColor: "text-black", icon: "rocket" },
                  { iconBg: "bg-[#BBF7D0] border border-black", iconColor: "text-black", icon: "business" }
                ];
                const theme = colors[i % colors.length];
                return (
                  <div
                    key={name}
                    className={`flex items-center gap-3 p-2 bg-[#F9FAFB] ${BORDER} hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer`}
                  >
                    <div className={`w-10 h-10 ${theme.iconBg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${theme.iconColor} text-sm`}>{theme.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold">{name}</p>
                      <p className="text-xs font-medium text-gray-500">{roles} Active Roles • {hiringVelocity} hiring</p>
                    </div>
                    <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Level Bar Chart - Dynamic from API */}
          <div className={`lg:col-span-5 bg-white ${BORDER} p-6`} style={NEO}>
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Experience Level Distribution</h3>
            <div className="flex items-end justify-between h-32 gap-3 px-2">
              {(marketData?.experience_distribution?.length > 0 ? marketData.experience_distribution : EXP_LEVELS).map((exp, i) => {
                const label = exp.level || exp.label;
                const percentage = exp.percentage || parseInt(exp.height) || 20;
                const height = `${percentage}%`;
                const bgColors = ["bg-[#D8B4FE]", "bg-[#BBF7D0]", "bg-[#1A4D2E]", "bg-[#FACC15]", "bg-[#FCA5A5]"];
                const bg = exp.bg || bgColors[i % bgColors.length];
                const avgSalary = exp.avg_salary;
                
                return (
                  <div key={label} className="flex flex-col items-center gap-2 w-full">
                    <div className={`w-full ${bg} ${BORDER}`} style={{ height, boxShadow: "2px 2px 0px 0px #000000" }}></div>
                    <span className="text-[10px] font-bold uppercase text-center leading-tight">{label}</span>
                    <span className="text-[8px] text-gray-500">{percentage}%</span>
                    {avgSalary > 0 && (
                      <span className="text-[8px] font-bold text-[#1A4D2E]">{currencySymbol}{Math.floor(avgSalary/1000)}k</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geographic Distribution - Dynamic from API */}
          <div className={`lg:col-span-7 bg-white ${BORDER} p-6 relative overflow-hidden min-h-[220px]`} style={NEO}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Geographic Distribution</h3>
              <div className={`bg-black text-white px-3 py-1 text-xs font-bold ${BORDER}`}>
                {marketData?.geographic_distribution?.[0]?.country || location.split(',')[0] || "Top Market"}
              </div>
            </div>
            {/* Background map SVG */}
            <div className="w-full h-full opacity-20 absolute inset-0 pointer-events-none">
              <svg className="w-full h-full fill-current text-[#1A4D2E]" viewBox="0 0 1000 500">
                <path d="M150,150 L200,100 L300,120 L350,200 L320,280 L250,300 L180,250 Z" />
                <path d="M500,80 L600,50 L750,100 L800,200 L700,300 L550,280 L520,180 Z" />
                <path d="M600,350 L750,330 L850,400 L800,480 L650,470 Z" />
              </svg>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-8 mt-10">
              {(marketData?.geographic_distribution?.length > 0 
                ? [marketData.geographic_distribution.slice(0, 3), marketData.geographic_distribution.slice(3, 6)]
                : [GEO_LEFT, GEO_RIGHT]
              ).map((col, ci) => (
                <div key={ci} className="space-y-4">
                  {col.map((geo, idx) => {
                    const country = geo.country || geo.country;
                    const pct = geo.percentage + "%" || geo.pct;
                    const isTop = ci === 0 && idx === 0;
                    return (
                      <div key={country} className="flex justify-between items-center border-b border-black pb-2">
                        <span className="font-bold">{country}</span>
                        <span className={`${isTop ? "bg-[#D8B4FE]" : "bg-gray-100"} px-2 border border-black text-xs font-bold`}>{pct}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className={`mt-12 bg-[#1A4D2E] text-white p-8 ${BORDER} flex flex-col md:flex-row items-center justify-between gap-6`} style={NEO}>
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-black mb-3 uppercase leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
              Ready to leverage these insights?
            </h2>
            <p className="text-green-100 font-medium">Update your profile to match current market demands and increase your visibility to top recruiters.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              className={`bg-[#D8B4FE] text-black font-extrabold px-10 py-4 ${BORDER} uppercase italic transition-all hover:translate-x-[2px] hover:translate-y-[2px]`}
              style={NEO_WHITE}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, NEO_WHITE_SM)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, NEO_WHITE)}
              onClick={() => navigate('/profile')}
            >
              Update Profile
            </button>
            <button
              className={`bg-white text-black font-extrabold px-10 py-4 ${BORDER} uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px]`}
              style={NEO_WHITE}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, NEO_WHITE_SM)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, NEO_WHITE)}
              onClick={() => navigate('/discover')}
            >
              Find Matches
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select
          className="appearance-none bg-white border-2 border-black px-4 py-3 pr-10 font-bold focus:ring-0 focus:outline-none min-w-[200px]"
          style={NEO_SM}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none">expand_more</span>
      </div>
    </div>
  );
}
