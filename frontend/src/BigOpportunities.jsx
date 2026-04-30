import React, { useState, useEffect } from "react";
import SectionTitle from "./components/SectionTitle";
const NAV_LINKS = ["Big Opportunities", "Mass Hiring", "Campus Drives"];

const MASS_HIRING = [
  {
    title: "Global Systems",
    badge: "200+ Openings",
    desc: "Bulk hiring for Junior Associates and System Engineers across 12 locations.",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    icon: "domain",
  },
  {
    title: "Tech Solutions",
    badge: "150+ Openings",
    desc: "Join the digital transformation team. Hiring for cloud and infrastructure roles.",
    bg: "bg-green-50",
    iconColor: "text-green-600",
    icon: "dns",
  },
  {
    title: "InfraGlobal",
    badge: "300+ Openings",
    desc: "Mega walk-in drive for Java and Python developers this weekend.",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    icon: "terminal",
  },
];

const FAANG_JOBS = [
  {
    title: "Senior Software Engineer",
    company: "Global Search Leader",
    location: "Bangalore, IN",
    salary: "₹140k - ₹220k",
    tags: [{ label: "Hybrid", bg: "bg-blue-100" }, { label: "L5 Level", bg: "bg-gray-100" }],
    iconBg: "bg-gray-100",
    icon: "search",
    iconColor: "text-gray-800",
  },
  {
    title: "Cloud Architect",
    company: "Cloud Services Titan",
    location: "Hyderabad, IN",
    salary: "₹120k - ₹190k",
    tags: [{ label: "On-site", bg: "bg-green-100" }, { label: "Specialist", bg: "bg-gray-100" }],
    iconBg: "bg-orange-50",
    icon: "shopping_cart",
    iconColor: "text-orange-600",
  },
  {
    title: "Product Manager",
    company: "OS & Productivity Giant",
    location: "Redmond, US",
    salary: "₹160k - ₹240k",
    tags: [{ label: "Remote", bg: "bg-purple-100" }, { label: "Senior", bg: "bg-gray-100" }],
    iconBg: "bg-blue-50",
    icon: "window",
    iconColor: "text-blue-700",
  },
];

const STARTUPS = [
  { icon: "payments", label: "FintechOne", bg: "bg-blue-100", color: "text-blue-600" },
  { icon: "credit_card", label: "PayShield", bg: "bg-pink-100", color: "text-pink-600" },
  { icon: "local_shipping", label: "SwiftLog", bg: "bg-yellow-100", color: "text-yellow-600" },
  { icon: "monitoring", label: "DataPulse", bg: "bg-green-100", color: "text-green-600" },
  { icon: "rocket_launch", label: "Nebula", bg: "bg-purple-100", color: "text-purple-600" },
  { icon: "restaurant", label: "QuickBite", bg: "bg-orange-100", color: "text-orange-600" },
];

const CAMPUS_DRIVES = [
  {
    month: "Oct",
    day: "24",
    title: "2026 Batch Mega Drive",
    location: "Virtual Presence",
    deadline: "Oct 20, 2023",
    dateBg: "bg-yellow-400",
    dateText: "text-black",
  },
  {
    month: "Nov",
    day: "02",
    title: "Design Internship Bootcamp",
    location: "Mumbai Hub",
    deadline: "Oct 28, 2023",
    dateBg: "bg-[#1A4D2E]",
    dateText: "text-white",
  },
  {
    month: "Nov",
    day: "15",
    title: "QA & Automation Freshers",
    location: "PAN India",
    deadline: "Nov 10, 2023",
    dateBg: "bg-orange-400",
    dateText: "text-black",
  },
];

const NEO_SHADOW = { boxShadow: "4px 4px 0px 0px #000000" };
const NEO_SHADOW_SM = { boxShadow: "2px 2px 0px 0px #000000" };

export default function BigOpportunities() {
  useEffect(() => {
    document.title = "Big Opportunities — JobFor";
  }, []);

  return (
    <div className="bg-[#F3E8FF] text-gray-900 min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      {/* MAIN */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 border-box">

        <div className="main-layout" style={{ display: "flex", flexWrap: "wrap", gap: "48px", marginTop: "32px" }}>
          
          <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
        <section className="mb-12">
          <SectionTitle color="bg-[#1A4D2E]" title="MASS HIRING NOW" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MASS_HIRING.map(({ title, badge, desc, bg, iconColor, icon }) => (
              <div
                key={title}
                className="bg-white border-2 border-black p-6 flex flex-col items-center text-center relative overflow-hidden transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                style={NEO_SHADOW}
              >
                <div className="absolute -top-1 -right-1 bg-[#F97316] text-white px-3 py-1 font-bold border-2 border-black text-sm flex items-center gap-1">
                  🔥 {badge}
                </div>
                <div className={`w-14 h-14 ${bg} border-2 border-black flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
                <p className="text-gray-600 mb-6">{desc}</p>
                <button className="w-full bg-black text-white py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-colors">
                  View All Roles
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAANG & TOP TECH */}
        <section className="mb-12">
          <SectionTitle color="bg-[#D8B4FE]" title="FAANG & TOP TECH" />
          <div className="space-y-3">
            {FAANG_JOBS.map(({ title, company, location, salary, tags, iconBg, icon, iconColor }) => (
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
                  className="bg-[#1A4D2E] text-white font-bold py-2 px-8 border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                  style={NEO_SHADOW_SM}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* UNICORN STARTUPS */}
        <section className="mb-12">
          <SectionTitle color="bg-[#F97316]" title="UNICORN STARTUPS" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {STARTUPS.map(({ icon, label, bg, color }) => (
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

        {/* CAMPUS DRIVES */}
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
            {CAMPUS_DRIVES.map(({ month, day, title, location, deadline, dateBg, dateText }) => (
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
                    className="bg-[#D8B4FE] text-black font-bold py-2 px-6 border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={NEO_SHADOW_SM}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        </div> {/* End of main content area */}

        </div>
      </main>

    </div>
  );
}
