import { useState, useEffect } from "react";

const NAV_LINKS = ["Find Jobs", "Companies", "Candidates", "Resources"];

const STATS = [
  { value: "10,000+", label: "Active Jobs Indexed", bg: "bg-green-50", iconBg: "bg-[#1A4D2E]", iconColor: "text-white", icon: "work_outline" },
  { value: "AI-Driven", label: "Smart Resume Matching", bg: "bg-purple-50", iconBg: "bg-[#D8B4FE]", iconColor: "text-black", icon: "psychology" },
  { value: "100%", label: "Free for Seekers", bg: "bg-yellow-50", iconBg: "bg-yellow-400", iconColor: "text-black", icon: "verified" },
];

const CATEGORIES = [
  { label: "Design", count: 234, bg: "bg-red-100", color: "text-red-600", icon: "palette" },
  { label: "Tech", count: 450, bg: "bg-blue-100", color: "text-blue-600", icon: "code" },
  { label: "Healthcare", count: 120, bg: "bg-green-100", color: "text-green-600", icon: "medical_services" },
  { label: "Marketing", count: 89, bg: "bg-purple-100", color: "text-purple-600", icon: "campaign" },
  { label: "Finance", count: 156, bg: "bg-orange-100", color: "text-orange-600", icon: "account_balance" },
  { label: "Education", count: 98, bg: "bg-teal-100", color: "text-teal-600", icon: "school" },
  { label: "Writing", count: 67, bg: "bg-pink-100", color: "text-pink-600", icon: "edit_note" },
  { label: "Science", count: 45, bg: "bg-indigo-100", color: "text-indigo-600", icon: "science" },
];

const VACANCIES = [
  {
    title: "Senior Product Designer",
    type: "Full-time",
    typeBg: "bg-blue-100 text-blue-800",
    company: "Acme Corp",
    location: "Remote",
    salary: "₹120k - ₹150k / year",
    skills: ["UI/UX", "Figma", "Prototyping"],
    icon: "bolt",
    iconColor: "text-blue-600",
  },
  {
    title: "Frontend Developer",
    type: "Contract",
    typeBg: "bg-green-100 text-green-800",
    company: "TechFlow Inc.",
    location: "New York, NY",
    salary: "₹80 - ₹120 / hour",
    skills: ["React", "Tailwind", "TypeScript"],
    icon: "code",
    iconColor: "text-green-600",
  },
  {
    title: "Marketing Manager",
    type: "Full-time",
    typeBg: "bg-purple-100 text-purple-800",
    company: "GrowthSpike",
    location: "London, UK",
    salary: "₹55k - ₹70k / year",
    skills: ["SEO", "Strategy", "Content"],
    icon: "campaign",
    iconColor: "text-purple-600",
  },
  {
    title: "Finance Associate",
    type: "Part-time",
    typeBg: "bg-red-100 text-red-800",
    company: "GlobalBank",
    location: "Chicago, IL",
    salary: "₹35 - ₹45 / hour",
    skills: ["Excel", "Analysis", "Accounting"],
    icon: "account_balance",
    iconColor: "text-red-600",
  },
];

const MARQUEE_ITEMS = [
  { icon: "corporate_fare", label: "TCS" },
  { icon: "computer", label: "Infosys" },
  { icon: "language", label: "Wipro" },
  { icon: "business", label: "HCLTech" },
  { icon: "devices", label: "Tech Mahindra" },
];

export default function JobForLanding() {
  useEffect(() => {
    document.title = "JobFor — Find Your Dream Job";
  }, []);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="bg-[#F9FAFB] text-gray-900 font-sans min-h-screen">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />

      {/* HERO */}
      <section className="pt-12 pb-16 lg:pt-16 lg:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1
                className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none mb-5 text-black"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                GET YOUR <br />
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A4D2E] to-green-600"
                  style={{ WebkitTextStroke: "1px #1A4D2E" }}
                >
                  DREAM JOB
                </span>{" "}
                TODAY
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Connect with top employers and discover opportunities that match your skills. Your next career move is just a search away.
              </p>
              {/* Search bar */}
              <div
                className="bg-white border-2 border-black p-2 flex flex-col sm:flex-row gap-2 max-w-xl"
                style={{ boxShadow: "4px 4px 0px 0px #000000" }}
              >
                <div className="flex-grow relative">
                  <span className="material-icons-outlined absolute left-3 top-3 text-gray-400">search</span>
                  <input
                    className="w-full pl-10 pr-3 py-3 border-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Job title or keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-gray-200"></div>
                <div className="flex-grow relative">
                  <span className="material-icons-outlined absolute left-3 top-3 text-gray-400">location_on</span>
                  <input
                    className="w-full pl-10 pr-3 py-3 border-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button className="bg-[#1A4D2E] hover:bg-green-900 text-white font-bold py-3 px-8 border-2 border-black transition-all">
                  Search
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">*Find the position &amp; location that suits you best</p>
            </div>

            {/* Hero image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute inset-0 bg-[#D8B4FE] w-4/5 h-4/5 mx-auto mt-10 rounded-full blur-3xl opacity-30"></div>
              <div
                className="relative border-4 border-black bg-green-100 z-0 rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden w-full max-w-md aspect-[4/5]"
                style={{ boxShadow: "4px 4px 0px 0px #000000" }}
              >
                <img
                  alt="Indian professional tech worker holding laptop smiling"
                  className="object-cover w-full h-full"
                  src="/hero_professional_worker.png"
                />
                {[
                  { top: "top-10 left-4", icon: "code", color: "text-blue-500", label: "Developer", dur: "3s" },
                  { top: "bottom-20 -right-4", icon: "design_services", color: "text-green-500", label: "Designer", dur: "4s" },
                  { top: "top-1/2 -left-6", icon: "analytics", color: "text-purple-500", label: "Analyst", dur: "5s" },
                ].map(({ top, icon, color, label, dur }) => (
                  <div
                    key={label}
                    className={`absolute ${top} bg-white border-2 border-black p-2 rounded-lg flex items-center gap-2 animate-bounce`}
                    style={{ boxShadow: "2px 2px 0px 0px #000000", animationDuration: dur }}
                  >
                    <span className={`material-icons-outlined ${color}`}>{icon}</span>
                    <span className="font-bold text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-black py-6 border-y-2 border-black overflow-hidden whitespace-nowrap">
        <div className="inline-flex items-center space-x-12" style={{ animation: "marquee 20s linear infinite" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(({ icon, label }, i) => (
            <span key={i} className="text-white text-xl font-bold uppercase flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span className="material-icons-outlined">{icon}</span> {label}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* WHY WE'RE THE BEST */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              WHY WE'RE THE{" "}
              <span className="text-[#D8B4FE] italic" style={{ WebkitTextStroke: "1px black", textShadow: "2px 2px 0px black" }}>
                BEST
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Connecting talent with opportunity for over a decade with unmatched success rates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STATS.map(({ value, label, bg, iconBg, iconColor, icon }) => (
              <div
                key={label}
                className={`${bg} p-8 border-2 border-black rounded-xl flex items-center gap-4`}
                style={{ boxShadow: "4px 4px 0px 0px #000000" }}
              >
                <div className={`w-16 h-16 ${iconBg} ${iconColor} flex items-center justify-center rounded-lg border-2 border-black`}>
                  <span className="material-icons-outlined text-3xl">{icon}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-black">{value}</h3>
                  <p className="text-gray-600 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black" style={{ fontFamily: "'Syne', sans-serif" }}>
              BROWSE BY <span className="bg-[#1A4D2E] text-white px-2">CATEGORY</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map(({ label, count, bg, color, icon }) => (
              <a
                key={label}
                href="#"
                className="group relative bg-white border-2 border-black p-6 rounded-lg transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                style={{ boxShadow: "4px 4px 0px 0px #000000" }}
              >
                <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mb-4 border border-black`}>
                  <span className={`material-icons-outlined ${color}`}>{icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-1 text-black">{label}</h3>
                <p className="text-sm text-gray-500 mb-4">{count} jobs posted</p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-icons-outlined">arrow_forward</span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-block bg-white text-black font-bold py-3 px-8 border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
              style={{ boxShadow: "4px 4px 0px 0px #000000" }}
            >
              View All Categories
            </a>
          </div>
        </div>
      </section>

      {/* POPULAR VACANCIES */}
      <section className="py-20 bg-[#D8B4FE]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              POPULAR{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A4D2E] to-green-600" style={{ WebkitTextStroke: "1px #000" }}>
                VACANCIES
              </span>
            </h2>
            <p className="text-gray-600">Top opportunities curated for you</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {VACANCIES.map(({ title, type, typeBg, company, location, salary, skills, icon, iconColor }) => (
              <div
                key={title}
                className="bg-white border-2 border-black rounded-lg p-6 flex flex-col md:flex-row gap-6 relative"
                style={{ boxShadow: "4px 4px 0px 0px #000000" }}
              >
                <button className="absolute top-4 right-4 text-gray-400 hover:text-[#1A4D2E]">
                  <span className="material-icons-outlined">bookmark_border</span>
                </button>
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                  <span className={`material-icons-outlined text-3xl ${iconColor}`}>{icon}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-black">{title}</h3>
                    <span className={`text-sm ${typeBg} px-2 py-0.5 rounded border`}>{type}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{company} • {location}</p>
                  <p className="text-sm text-gray-500 mb-4">{salary}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((s) => (
                      <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    className="w-full md:w-auto bg-[#D8B4FE] text-black font-bold py-2 px-6 border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                    style={{ boxShadow: "2px 2px 0px 0px #000000" }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-block bg-[#1A4D2E] text-white font-bold py-3 px-8 border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
              style={{ boxShadow: "4px 4px 0px 0px #000000" }}
            >
              View All Vacancies
            </a>
          </div>
        </div>
      </section>

      {/* CTA / SIGN UP BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-[#1A4D2E] rounded-3xl overflow-hidden border-2 border-black"
          style={{ boxShadow: "4px 4px 0px 0px #000000" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto bg-green-800">
              <img
                alt="Indian software team working"
                className="absolute inset-0 w-full h-full object-cover"
                src="/cta_indian_professionals.png"
              />
              <div className="absolute inset-0 bg-[#1A4D2E]/20"></div>
            </div>
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Sign up now <br />and find your <br />
                <span className="text-[#D8B4FE]" style={{ WebkitTextStroke: "1px black", textShadow: "2px 2px 0px black" }}>
                  Dream Job
                </span>
              </h2>
              <p className="text-green-100 mb-8 text-lg">
                We present an easy and fast way for job seekers to find suitable jobs. Register yourself and get started.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="w-full p-3 bg-white/10 border-2 border-white/30 text-white placeholder-green-200 focus:outline-none focus:border-white focus:bg-white/20 rounded-lg"
                    placeholder="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="w-full p-3 bg-white/10 border-2 border-white/30 text-white placeholder-green-200 focus:outline-none focus:border-white focus:bg-white/20 rounded-lg"
                    placeholder="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  className="w-full sm:w-auto bg-[#D8B4FE] text-black font-bold py-3 px-8 border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                  style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
