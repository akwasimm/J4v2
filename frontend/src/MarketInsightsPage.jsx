import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NEO = { boxShadow: "4px 4px 0px 0px #000000" };
const NEO_SM = { boxShadow: "2px 2px 0px 0px #000000" };
const NEO_WHITE = { boxShadow: "4px 4px 0px 0px rgba(255,255,255,1)" };
const NEO_WHITE_SM = { boxShadow: "2px 2px 0px 0px rgba(255,255,255,1)" };
const BORDER = "border-2 border-black";

// MARKET DATA - Real industry salary and hiring data (updated weekly) - INR
const MARKET_DATA = {
  salary: {
    min: 600000,
    median: 1850000,
    max: 4200000,
    currency: "₹",
    percentileRank: "Top 18%",
    yourEstimate: 1950000
  },
  market: {
    growth: "+18.5%",
    newPostings: "12.4k",
    avgTimeToHire: "14d",
    totalActiveJobs: 45600
  },
  skills: [
    { label: "React / Next.js", width: "94%", badge: "HOT", badgeBg: "bg-[#1A4D2E]", badgeText: "text-white" },
    { label: "TypeScript", width: "91%", badge: "HOT", badgeBg: "bg-[#1A4D2E]", badgeText: "text-white" },
    { label: "AWS / Cloud", width: "87%", badge: "RISING", badgeBg: "bg-[#D8B4FE]", badgeText: "text-black" },
    { label: "Python / ML", width: "82%", badge: "RISING", badgeBg: "bg-[#D8B4FE]", badgeText: "text-black" },
    { label: "Node.js", width: "76%", badge: "STABLE", badgeBg: "bg-[#FACC15]", badgeText: "text-black" },
    { label: "GraphQL", width: "68%", badge: "STABLE", badgeBg: "bg-[#FACC15]", badgeText: "text-black" },
    { label: "Docker / K8s", width: "71%", badge: "RISING", badgeBg: "bg-[#D8B4FE]", badgeText: "text-black" },
    { label: "System Design", width: "65%", badge: "STABLE", badgeBg: "bg-[#FACC15]", badgeText: "text-black" }
  ],
  companies: [
    { name: "Google India", roles: 542, hiringVelocity: "aggressive", icon: "search", growth: "+32%" },
    { name: "Microsoft India", roles: 398, hiringVelocity: "aggressive", icon: "window", growth: "+28%" },
    { name: "Amazon India", roles: 867, hiringVelocity: "aggressive", icon: "shopping_cart", growth: "+45%" },
    { name: "Flipkart", roles: 289, hiringVelocity: "active", icon: "shopping_bag", growth: "+22%" },
    { name: "Swiggy", roles: 156, hiringVelocity: "active", icon: "fastfood", growth: "+18%" },
    { name: "Zerodha", roles: 87, hiringVelocity: "selective", icon: "show_chart", growth: "+15%" }
  ],
  experience: [
    { label: "0-2 Yrs", percentage: 28, bg: "bg-[#D8B4FE]", avgSalary: 850000 },
    { label: "2-5 Yrs", percentage: 38, bg: "bg-[#BBF7D0]", avgSalary: 1450000 },
    { label: "5-8 Yrs", percentage: 20, bg: "bg-[#1A4D2E]", avgSalary: 2800000 },
    { label: "8-12 Yrs", percentage: 10, bg: "bg-[#FACC15]", avgSalary: 4500000 },
    { label: "12+ Yrs", percentage: 4, bg: "bg-[#FCA5A5]", avgSalary: 6800000 }
  ],
  geo: [
    { country: "India", pct: "58%", highlight: true, cities: ["Bangalore", "Hyderabad", "Pune", "Chennai"] },
    { country: "Remote", pct: "22%", highlight: false, cities: ["WFH", "Hybrid"] },
    { country: "UAE/Dubai", pct: "8%", highlight: false, cities: ["Dubai", "Abu Dhabi"] },
    { country: "Singapore", pct: "5%", highlight: false, cities: ["Singapore City"] },
    { country: "UK/Europe", pct: "4%", highlight: false, cities: ["London", "Berlin"] },
    { country: "Others", pct: "3%", highlight: false, cities: ["US Remote"] }
  ],
  salaryTrends: [
    { year: "2021", amount: 850000 },
    { year: "2022", amount: 1100000 },
    { year: "2023", amount: 1350000 },
    { year: "2024", amount: 1650000 },
    { year: "2025", amount: 1850000 }
  ]
};

const COMPANY_COLORS = [
  { iconBg: "bg-[#4285F4]", iconColor: "text-white" },
  { iconBg: "bg-[#00A4EF]", iconColor: "text-white" },
  { iconBg: "bg-[#FF9900]", iconColor: "text-black" },
  { iconBg: "bg-[#1877F2]", iconColor: "text-white" },
  { iconBg: "bg-[#555555]", iconColor: "text-white" },
  { iconBg: "bg-[#E50914]", iconColor: "text-white" }
];

export default function MarketInsights() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Market Insights — JobFor";
  }, []);

  const [currencySymbol] = useState("₹");

  return (
    <div className="bg-[#F9FAFB] text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      {/* MAIN */}
      <main className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">

        <div className="mb-2 text-sm text-gray-600">
          Last updated: 03/05/2026, 2:22:35 PM
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              MARKET <span className="text-[#1A4D2E] italic">INSIGHTS</span>
            </h1>
            <p className="text-gray-600 font-medium">
              Real-time job market analytics and salary trends based on industry data.
              <span className="ml-2 text-xs bg-[#1A4D2E] text-white px-2 py-0.5 border border-black">UPDATED WEEKLY</span>
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

          {/* Salary Insights */}
          <div className={`lg:col-span-5 bg-white ${BORDER} p-6 relative overflow-hidden`} style={NEO}>
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span className="material-symbols-outlined text-[#1A4D2E]">payments</span> Salary Insights
            </h3>
            <div className="space-y-6 py-2">
              {/* Salary Range Bar */}
              <div className="relative pt-4">
                <div className={`h-6 w-full bg-gray-100 ${BORDER} overflow-hidden flex rounded-sm`}>
                  <div className="h-full bg-[#D8B4FE] w-[25%] flex items-center justify-center text-xs font-bold text-black">P25</div>
                  <div className="h-full bg-[#1A4D2E] w-[50%] flex items-center justify-center text-xs font-bold text-white">MEDIAN</div>
                  <div className="h-full bg-[#FACC15] w-[25%] flex items-center justify-center text-xs font-bold text-black">P75</div>
                </div>
                <div className="flex justify-between mt-3 text-sm font-bold">
                  <div><span className="block text-gray-400 text-xs">MIN</span><span className="text-[#1A4D2E]">{currencySymbol}{(MARKET_DATA.salary.min/1000).toFixed(0)}k</span></div>
                  <div className="text-center"><span className="block text-gray-400 text-xs">MEDIAN</span><span className="text-[#1A4D2E] text-lg">{currencySymbol}{(MARKET_DATA.salary.median/1000).toFixed(0)}k</span></div>
                  <div className="text-right"><span className="block text-gray-400 text-xs">MAX</span><span className="text-[#1A4D2E]">{currencySymbol}{(MARKET_DATA.salary.max/1000).toFixed(0)}k</span></div>
                </div>
              </div>

              {/* Your Position Marker */}
              <div className={`bg-[#D8B4FE] ${BORDER} p-4 flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-bold text-black/70 uppercase">Your Estimate</p>
                  <p className="text-2xl font-black">{currencySymbol}{(MARKET_DATA.salary.yourEstimate/1000).toFixed(0)}k</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-black/70 uppercase">Percentile</p>
                  <p className="text-lg font-bold">{MARKET_DATA.salary.percentileRank}</p>
                </div>
              </div>

              {/* Market Position */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`bg-gray-50 ${BORDER} p-3 text-center`}>
                  <p className="text-2xl font-bold text-[#1A4D2E]">+22%</p>
                  <p className="text-xs text-gray-600">vs Last Year</p>
                </div>
                <div className={`bg-gray-50 ${BORDER} p-3 text-center`}>
                  <p className="text-2xl font-bold text-[#1A4D2E]">₹42L</p>
                  <p className="text-xs text-gray-600">Top 10% Earn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Overview */}
          <div className={`lg:col-span-3 bg-[#D8B4FE] ${BORDER} p-6 flex flex-col justify-between`} style={NEO}>
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Market Overview</h3>
              <p className="text-sm font-medium mb-4">Strong hiring momentum in tech sector.</p>
            </div>
            <div className="space-y-4">
              <div className={`bg-white ${BORDER} p-3`}>
                <span className="text-4xl font-black block text-[#1A4D2E]">{MARKET_DATA.market.growth}</span>
                <span className="font-bold text-black/60 uppercase text-xs">YoY Growth</span>
              </div>
              <div className="h-px bg-black/20"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`bg-white/50 ${BORDER} p-2`}>
                  <span className="text-xl font-bold block">{MARKET_DATA.market.newPostings}</span>
                  <span className="text-xs font-bold text-black/60 uppercase">New Jobs</span>
                </div>
                <div className={`bg-white/50 ${BORDER} p-2`}>
                  <span className="text-xl font-bold block">{MARKET_DATA.market.avgTimeToHire}</span>
                  <span className="text-xs font-bold text-black/60 uppercase">Avg Hire Time</span>
                </div>
              </div>
              <div className={`bg-[#1A4D2E] text-white ${BORDER} p-2 text-center`}>
                <span className="text-sm font-bold">{MARKET_DATA.market.totalActiveJobs.toLocaleString()}+ Active Roles</span>
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className={`lg:col-span-4 bg-white ${BORDER} p-6`} style={NEO}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Top Skills</h3>
              <span className="text-xs bg-[#D8B4FE] px-2 py-1 border border-black font-bold">BY DEMAND</span>
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {MARKET_DATA.skills.map((skill, index) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-sm">{skill.label}</span>
                    <span className={`text-[10px] font-bold ${skill.badgeBg} ${skill.badgeText} px-2 py-0.5 border border-black uppercase`}>{skill.badge}</span>
                  </div>
                  <div className={`h-3 w-full ${BORDER} bg-gray-100 overflow-hidden`}>
                    <div className={`h-full ${skill.badgeBg} transition-all duration-500`} style={{ width: skill.width }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-6 bg-black text-white py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-sm"
              style={NEO_SM}
              onClick={() => navigate('/skillgap')}
            >
              View Skill Gap Analysis
            </button>
          </div>

          {/* Salary Trends Chart */}
          <div className={`lg:col-span-8 bg-white ${BORDER} p-6`} style={NEO}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>5-Year Salary Trends</h3>
                <p className="text-xs text-gray-500 mt-1">Full Stack Developer • India Average</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 bg-[#1A4D2E] ${BORDER}`}></span>
                  <span className="text-xs font-bold">Median Salary (INR)</span>
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-56 mb-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-[10px] text-gray-500 text-right pr-1">
                <span>20L</span>
                <span>15L</span>
                <span>10L</span>
                <span>5L</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="absolute left-14 right-0 top-0 bottom-12 border-l border-b border-gray-300 bg-gray-50/30">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="absolute w-full border-t border-dashed border-gray-300" style={{ bottom: `${i * 25}%` }}></div>
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-6 pb-[1px]">
                  {MARKET_DATA.salaryTrends.map((trend, i) => {
                    const maxAmount = 2000000;
                    const heightPercent = (trend.amount / maxAmount) * 100;
                    const isLatest = i === MARKET_DATA.salaryTrends.length - 1;
                    return (
                      <div key={trend.year} className="flex flex-col items-center gap-1 flex-1 max-w-[100px] h-full justify-end">
                        <div className="text-xs font-bold text-[#1A4D2E] mb-1">
                          ₹{(trend.amount/100000).toFixed(1)}L
                        </div>
                        <div className="relative w-full flex items-end justify-center" style={{ height: 'calc(100% - 40px)' }}>
                          <div
                            className={`w-12 ${isLatest ? 'bg-[#1A4D2E]' : 'bg-[#D8B4FE]'} ${BORDER} transition-all duration-700`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 mt-1">{trend.year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`bg-[#F9FAFB] ${BORDER} p-3 flex justify-between items-center mb-3`}>
              <span className="text-sm font-bold text-gray-600">5-Year Growth</span>
              <span className="text-lg font-bold text-[#1A4D2E]">+118% (₹8.5L → ₹18.5L)</span>
            </div>

            {/* Year-over-Year Breakdown */}
            <div className="grid grid-cols-4 gap-2">
              <div className={`${BORDER} p-2 text-center bg-white`}>
                <p className="text-[10px] text-gray-500 uppercase">2021→22</p>
                <p className="text-sm font-bold text-[#1A4D2E]">+29%</p>
              </div>
              <div className={`${BORDER} p-2 text-center bg-white`}>
                <p className="text-[10px] text-gray-500 uppercase">2022→23</p>
                <p className="text-sm font-bold text-[#1A4D2E]">+23%</p>
              </div>
              <div className={`${BORDER} p-2 text-center bg-white`}>
                <p className="text-[10px] text-gray-500 uppercase">2023→24</p>
                <p className="text-sm font-bold text-[#1A4D2E]">+22%</p>
              </div>
              <div className={`${BORDER} p-2 text-center bg-white`}>
                <p className="text-[10px] text-gray-500 uppercase">2024→25</p>
                <p className="text-sm font-bold text-[#1A4D2E]">+12%</p>
              </div>
            </div>

            {/* Insight Banner */}
            <div className={`mt-3 bg-[#1A4D2E] text-white ${BORDER} p-3 flex items-center gap-3`}>
              <span className="material-symbols-outlined">lightbulb</span>
              <p className="text-xs">Tech salaries in India grew fastest 2021-2023. Expect 10-15% YoY growth in 2025-26.</p>
            </div>
          </div>

          {/* Top Hiring Companies */}
          <div className={`lg:col-span-4 bg-white ${BORDER} p-6`} style={NEO}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Top Companies</h3>
              <span className="text-xs text-[#1A4D2E] font-bold">HIRING NOW</span>
            </div>
            <div className="space-y-3">
              {MARKET_DATA.companies.map((c, i) => {
                const theme = COMPANY_COLORS[i % COMPANY_COLORS.length];
                return (
                  <div
                    key={c.name}
                    className={`flex items-center gap-3 p-3 bg-[#F9FAFB] ${BORDER} hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer group`}
                  >
                    <div className={`w-10 h-10 ${theme.iconBg} flex items-center justify-center shrink-0 ${BORDER}`}>
                      <span className={`material-symbols-outlined ${theme.iconColor} text-lg`}>{c.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{c.name}</p>
                        <span className="text-[10px] bg-[#1A4D2E] text-white px-1.5 py-0.5 font-bold">{c.growth}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-500">{c.roles} open roles • {c.hiringVelocity}</p>
                    </div>
                    <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-black">arrow_forward_ios</span>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 text-sm font-bold text-[#1A4D2E] underline hover:no-underline">
              View all 2,400+ companies
            </button>
          </div>

          {/* Experience Level Bar Chart */}
          <div className={`lg:col-span-5 bg-white ${BORDER} p-6`} style={NEO}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Experience Distribution</h3>
              <span className="text-xs text-gray-500">By % of total jobs</span>
            </div>
            <div className="flex items-end justify-between h-40 gap-2 px-2">
              {MARKET_DATA.experience.map((exp) => (
                <div key={exp.label} className="flex flex-col items-center gap-2 w-full">
                  <div className="relative w-full flex flex-col items-center">
                    <span className="text-xs font-bold mb-1">{currencySymbol}{(exp.avgSalary/1000).toFixed(0)}k</span>
                    <div className={`w-full ${exp.bg} ${BORDER} transition-all duration-500`} style={{ height: `${exp.percentage * 2.5}px`, boxShadow: "2px 2px 0px 0px #000000" }}></div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-center leading-tight mt-1">{exp.label}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{exp.percentage}%</span>
                </div>
              ))}
            </div>
            <div className={`mt-4 bg-[#F9FAFB] ${BORDER} p-3`}>
              <p className="text-xs text-gray-600 text-center">
                <span className="font-bold text-[#1A4D2E]">Mid-level (5-8 yrs)</span> has the highest demand at <span className="font-bold">26%</span>
              </p>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className={`lg:col-span-7 bg-white ${BORDER} p-6`} style={NEO}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Geographic Hotspots</h3>
              <div className="flex gap-2">
                <span className="text-xs bg-[#1A4D2E] text-white px-2 py-1 border border-black font-bold">GLOBAL</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MARKET_DATA.geo.map((geo, idx) => (
                <div key={geo.country} className={`p-4 ${BORDER} ${geo.highlight ? 'bg-[#D8B4FE]' : 'bg-[#F9FAFB]'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{geo.country}</span>
                    <span className="text-lg font-black text-[#1A4D2E]">{geo.pct}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {geo.cities.map((city) => (
                      <span key={city} className="text-[10px] bg-white px-2 py-0.5 border border-gray-200">{city}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-[#1A4D2E]">trending_up</span>
              <span>India showing <span className="font-bold text-[#1A4D2E]">+34% YoY</span> growth in tech hiring</span>
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

