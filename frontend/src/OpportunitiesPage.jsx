import React, { useState, useEffect } from "react";
import SectionTitle from "./components/SectionTitle";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'
import { getOpportunities, getOpportunitiesStatus } from './api/client'

const NAV_LINKS = ["Big Opportunities", "Mass Hiring", "Campus Drives"];

const NEO_SHADOW = { boxShadow: "4px 4px 0px 0px #000000" };
const NEO_SHADOW_SM = { boxShadow: "2px 2px 0px 0px #000000" };

export default function BigOpportunities() {
  // Placeholder check
  if (!FEATURES.opportunities) {
    return <ComingSoon pageName="Big Opportunities" description="Mass hiring and campus drives" />
  }

  const [data, setData] = useState({
    mass_hiring: [],
    product_companies: [],
    mnc_roles: [],
    campus_drives: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAllMassHiring, setShowAllMassHiring] = useState(false);

  // Company website URLs mapping
  const companyWebsites = {
    "Tata Consultancy Services (TCS)": "https://www.tcs.com/careers",
    "Wipro": "https://careers.wipro.com",
    "Infosys": "https://www.infosys.com/careers.html",
    "HCL Technologies": "https://www.hcltech.com/careers",
    "L&T Infotech": "https://www.lntinfotech.com/careers",
    "Tech Mahindra": "https://careers.techmahindra.com",
    "Mphasis": "https://www.mphasis.com/careers.html",
    "Cognizant India": "https://careers.cognizant.com"
  };

  useEffect(() => {
    document.title = "Big Opportunities — JobFor";
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getOpportunities();
      
      if (response.categories) {
        setData({
          mass_hiring: response.categories.mass_hiring?.data || [],
          product_companies: response.categories.product_companies?.data || [],
          mnc_roles: response.categories.mnc_roles?.data || [],
          campus_drives: response.categories.campus_drives?.data || []
        });
        setLastUpdated(response.last_updated);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3E8FF] text-gray-900 min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      <main className="max-w-[1600px] mx-auto px-6 py-6 border-box">

        {lastUpdated && (
          <div className="mb-4 text-sm text-gray-600">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl font-bold">Loading opportunities...</div>
          </div>
        ) : (
          <div className="main-layout" style={{ display: "flex", flexWrap: "wrap", gap: "48px", marginTop: "32px" }}>
            <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
              <section className="mb-10">
                <SectionTitle color="bg-[#1A4D2E]" title="MASS HIRING NOW" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showAllMassHiring ? data.mass_hiring : data.mass_hiring.slice(0, 6)).map(({ title, badge, desc, bg, iconColor, icon }) => (
                    <div
                      key={title}
                      className="bg-white border-2 border-black p-4 flex flex-col items-center text-center relative overflow-hidden transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                      style={NEO_SHADOW}
                    >
                      <div className="absolute -top-1 -right-1 bg-[#F97316] text-white px-2 py-0.5 font-bold border-2 border-black text-xs flex items-center gap-1">
                        🔥 {badge}
                      </div>
                      <div className={`w-10 h-10 ${bg} border-2 border-black flex items-center justify-center mb-3`}>
                        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{desc}</p>
                      <a
                        href={companyWebsites[title] || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-black text-white py-1.5 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors text-sm text-center"
                      >
                        Visit
                      </a>
                    </div>
                  ))}
                </div>
                {data.mass_hiring.length > 6 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowAllMassHiring(!showAllMassHiring)}
                      className="bg-[#1A4D2E] text-white py-2 px-6 font-bold border-2 border-black hover:bg-[#2D5F3F] transition-colors"
                      style={NEO_SHADOW_SM}
                    >
                      {showAllMassHiring ? "Show Less" : "Load More"}
                    </button>
                  </div>
                )}
              </section>

              <section className="mb-12">
                <SectionTitle color="bg-[#D8B4FE]" title="FAANG & TOP TECH" />
                <div className="space-y-3">
                  {data.mnc_roles.map(({ title, company, location, salary, tags, iconBg, icon, iconColor }) => (
                    <div
                      key={title}
                      className="bg-white border-2 border-black p-5 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                      style={NEO_SHADOW}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${iconBg} border-2 border-black flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{title}</h3>
                          <p className="text-sm text-gray-500 font-medium">{company} • {location}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end">
                        <div className="text-xl font-black text-[#1A4D2E] mb-2">{salary}</div>
                        <div className="flex gap-2">
                          {tags.map(({ label, bg }) => (
                            <span key={label} className={`px-2 py-1 ${bg} border border-black text-xs font-bold uppercase`}>{label}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="bg-gray-400 text-white font-bold py-2 px-8 border-2 border-black cursor-not-allowed"
                        style={NEO_SHADOW_SM}
                        disabled
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <SectionTitle color="bg-[#F97316]" title="UNICORN STARTUPS" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {data.product_companies.map(({ icon, label, bg, color }) => (
                    <a
                      key={label}
                      href="#"
                      className={`${bg} bg-white border-2 border-black p-4 flex flex-col items-center justify-center gap-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px]`}
                      style={NEO_SHADOW}
                    >
                      <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
                      <span className="font-bold text-sm">{label}</span>
                    </a>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1.5 bg-black"></div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Campus Hiring / Fresher Drives
                    </h2>
                  </div>
                  <button className="font-bold flex items-center gap-1 hover:underline">
                    View Calendar <span className="material-symbols-outlined text-lg">calendar_month</span>
                  </button>
                </div>

                <div className="border-2 border-black divide-y-2 divide-white" style={NEO_SHADOW}>
                  {data.campus_drives.map(({ month, day, title, location, deadline, dateBg, dateText }) => (
                    <div key={title} className="bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center border-2 border-black p-2 ${dateBg} ${dateText} min-w-[60px]`}>
                          <span className="text-xs font-bold uppercase">{month}</span>
                          <span className="text-xl font-black">{day}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span> {location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <p className="text-xs font-bold text-gray-400">Application Deadline</p>
                          <p className="text-sm font-bold">{deadline}</p>
                        </div>
                        <button
                          className="bg-gray-400 text-white font-bold py-2 px-6 border-2 border-black cursor-not-allowed"
                          style={NEO_SHADOW_SM}
                          disabled
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
