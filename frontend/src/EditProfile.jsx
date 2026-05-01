import React, { useState, useRef, useEffect } from "react";
import {
  uploadProfileImage, uploadResume, getProfile, updateProfile, updatePreferences,
  getSkills, getExperience, getEducation, getResumes, deleteResume, setDefaultResume, getPreferences,
  bulkUpdateSkills, bulkUpdateExperience, bulkUpdateEducation,
  getFileUrl
} from "./services/profileService.js";

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const initialSkills = [
  { id: 1, name: "Kubernetes", level: "Expert" },
  { id: 2, name: "AWS Ecosystem", level: "Advanced" },
  { id: 3, name: "Terraform", level: "Expert" },
  { id: 4, name: "Python / Go", level: "Advanced" },
  { id: 5, name: "CI/CD Pipeline Design", level: "Expert" },
];

const targetRoles = [
  { label: "Solutions Architect", selected: true },
  { label: "Infrastructure Lead", selected: true },
  { label: "VP Engineering", selected: false },
  { label: "CTO", selected: false },
];

const locationOptions = [
  { label: "Fully Remote", selected: true },
  { label: "Hybrid (SF)", selected: false },
  { label: "Hybrid (NYC)", selected: false },
  { label: "On-Site", selected: false },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function EditProfile() {
  useEffect(() => {
    document.title = "Edit Profile — JobFor";
  }, []);

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [targetRoles, setTargetRoles] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [targetSalary, setTargetSalary] = useState("185k");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [experience, setExperience] = useState([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    current: false,
    description: [""]
  });
  const [education, setEducation] = useState([]);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: "",
    field: "",
    school: "",
    info: ""
  });
  const [resumes, setResumes] = useState([]);
  const [showAddResume, setShowAddResume] = useState(false);
  const [newResume, setNewResume] = useState({
    name: ""
  });
  const [preferences, setPreferences] = useState({
    target_salary_min: null,
    target_salary_max: null,
    target_salary_currency: "USD",
    preferred_locations: [],
    open_to_relocation: false,
    employment_types: [],
    remote_preference: null,
    notice_period: null,
    industry_preference: [],
    job_level_preference: null
  });

  const [salaryRange, setSalaryRange] = useState({ min: 500000, max: 2000000 });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const indianITLocations = [
    "Bangalore", "Hyderabad", "Pune", "Mumbai", "Chennai",
    "Delhi NCR", "Gurgaon", "Noida", "Kolkata", "Ahmedabad",
    "Jaipur", "Chandigarh", "Coimbatore", "Kochi", "Mysore",
    "Trivandrum", "Indore", "Nagpur", "Vizag", "Goa"
  ];
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    location: "",
    headline: "",
    linkedin: "",
    github: "",
    leetcode: "",
    portfolio: "",
  });

  const [saveHover, setSaveHover] = useState(false);
  const [discardHover, setDiscardHover] = useState(false);
  const [addRoleHover, setAddRoleHover] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfile();
        // Backend returns: { profile: {...}, skills: [...], experience: [...], education: [...], preferences: {...} }
        const profile = profileData.profile || {};
        setProfileCompletion(profile.profile_completion || 0);

        // Update form with profile data
        setForm({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          location: profile.location || "",
          headline: profile.headline || "",
          linkedin: profile.linkedin || "",
          github: profile.github || "",
          leetcode: profile.leetcode || "",
          portfolio: profile.portfolio || "",
        });

        setAvatarUrl(getFileUrl(profile.avatar_url) || "");
        setResumeUrl(getFileUrl(profile.resume_url) || "");

        // Set skills from profile response (already included in getProfile)
        setSkills(profileData.skills || []);

        // Set experience from profile response
        setExperience(profileData.experience || []);

        // Set education from profile response
        setEducation(profileData.education || []);

        // Load resumes from database
        try {
          const resumesData = await getResumes();
          setResumes(resumesData.resumes || []);
        } catch (error) {
          console.error("Error loading resumes:", error);
        }

        // Load preferences from database
        try {
          const loadedPreferences = await getPreferences();
          // Backend returns preferences object directly (or empty defaults), not wrapped
          if (loadedPreferences) {
            setPreferences(loadedPreferences);

            // Sync salary range with loaded preferences
            if (loadedPreferences.target_salary_min || loadedPreferences.target_salary_max) {
              setSalaryRange({
                min: loadedPreferences.target_salary_min || 500000,
                max: loadedPreferences.target_salary_max || 2000000
              });
            }
          }
        } catch (error) {
          console.error("Error loading preferences:", error);
          // Preferences may be null/empty for new users, that's OK
        }

        // The backend GET endpoints (/skills, /experience, /education) already extract
        // data from resume_ai_data properly, so we don't need to manually merge it here anymore.

      } catch (error) {
        console.error("Error loading profile:", error);
        setUploadError(`Failed to load profile data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Helper to validate URL
  const isValidUrl = (url) => {
    if (!url || url.trim() === "") return true; // Empty is allowed
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // Save profile data
  const handleSaveProfile = async () => {
    if (saving) return; // Prevent double-click

    // Validate portfolio URL
    if (!isValidUrl(form.portfolio)) {
      setUploadError("Portfolio must be a valid URL starting with http:// or https:// (e.g., https://yourportfolio.com)");
      return;
    }

    setSaving(true);
    setUploadError("");

    try {
      // Send flat profile data matching backend ProfileUpdate schema
      // NOTE: Resume is NOT required for profile save - it's completely separate
      const profileUpdate = {
        first_name: form.first_name,
        last_name: form.last_name,
        headline: form.headline,
        location: form.location,
        linkedin: form.linkedin,
        github: form.github,
        leetcode: form.leetcode,
        portfolio: form.portfolio,
      };

      console.log("Saving profile data (no resume required):", profileUpdate);

      // Update basic profile - NO resume/PDF required
      await updateProfile(profileUpdate);
      console.log("Profile saved successfully");

      // Save skills to backend
      // Backend expects: { skills: [{ name, level, source }] }
      // level must be: "Beginner", "Intermediate", "Advanced", "Expert"
      if (skills && skills.length > 0) {
        try {
          const validLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
          const normalizeLevel = (level) => {
            if (!level) return "Intermediate";
            const cleanLevel = level.trim();
            // Check if level matches valid levels (case insensitive)
            const matched = validLevels.find(vl => vl.toLowerCase() === cleanLevel.toLowerCase());
            return matched || "Intermediate";
          };

          const skillsPayload = skills.map(s => ({
            name: s.name,
            level: normalizeLevel(s.level || s.proficiency_level),
            source: s.source || "manual"
          }));
          console.log("Sending skills payload:", skillsPayload);
          await bulkUpdateSkills({ skills: skillsPayload });
          console.log("Skills saved:", skills.length);
        } catch (skillsError) {
          console.error("Error saving skills:", skillsError);
          // Don't fail the whole save if skills fail
        }
      }

      // Save experience to backend
      // Backend expects: { experience: [{ title, company, location, start_date, end_date, current, description, source }] }
      if (experience && experience.length > 0) {
        try {
          const expPayload = experience.map(e => ({
            title: e.title,
            company: e.company,
            location: e.location,
            start_date: e.start_date || null,
            end_date: e.end_date || null,
            current: e.current || false,
            description: Array.isArray(e.description) ? e.description : (e.description ? [e.description] : []),
            source: e.source || "manual"
          }));
          console.log("Sending experience payload:", expPayload);
          await bulkUpdateExperience({ experience: expPayload });
          console.log("Experience saved:", experience.length);
        } catch (expError) {
          console.error("Error saving experience:", expError);
          // Don't fail the whole save if experience fails
        }
      }

      // Save education to backend
      // Backend expects: { education: [{ degree, field, school, info, source }] }
      if (education && education.length > 0) {
        try {
          const eduPayload = education.map(e => ({
            degree: e.degree,
            field: e.field,
            school: e.school,
            info: e.info || "",
            source: e.source || "manual"
          }));
          console.log("Sending education payload:", eduPayload);
          await bulkUpdateEducation({ education: eduPayload });
          console.log("Education saved:", education.length);
        } catch (eduError) {
          console.error("Error saving education:", eduError);
          // Don't fail the whole save if education fails
        }
      }

      // Update preferences separately if they exist
      if (preferences && preferences.employment_types) {
        try {
          await updatePreferences({
            employment_types: preferences.employment_types || [],
            remote_preference: preferences.remote_preference,
            target_salary_min: salaryRange.min,
            target_salary_max: salaryRange.max,
            target_salary_currency: "INR",
            preferred_locations: preferences.preferred_locations || [],
            open_to_relocation: preferences.open_to_relocation || false,
            notice_period: preferences.notice_period,
          });
        } catch (prefError) {
          console.error("Error saving preferences:", prefError);
          // Don't fail the whole save if preferences fail
        }
      }

      // Fetch updated profile completion
      const updatedProfile = await getProfile();
      setProfileCompletion(updatedProfile.profile?.profile_completion || 0);

      // Update localStorage for other components
      localStorage.setItem("user_first_name", form.first_name);

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      console.log("Profile updated successfully");
      setUploadSuccess("Profile saved successfully!");
      setTimeout(() => setUploadSuccess(""), 3000);

    } catch (error) {
      console.error("Error saving profile:", error);
      setUploadError(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = (skillId) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill = {
      id: `skill_${Date.now()}`,
      name: newSkillName.trim(),
      level: newSkillLevel
    };

    setSkills((prev) => [...prev, newSkill]);
    setNewSkillName("");
    setNewSkillLevel("Intermediate");
  };

  const handleAddExperience = () => {
    if (!newExperience.title.trim()) return;
    
    const newExp = {
      id: `exp_${Date.now()}`,
      title: newExperience.title.trim(),
      company: newExperience.company,
      location: newExperience.location,
      start_date: newExperience.start_date,
      end_date: newExperience.end_date || null,
      current: newExperience.current,
      description: newExperience.description.filter(d => d.trim())
    };

    setExperience((prev) => [...prev, newExp]);
    setNewExperience({
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      current: false,
      description: [""]
    });
    setShowAddExperience(false);
  };

  const handleDeleteExperience = (experienceId) => {
    setExperience((prev) => prev.filter((e) => e.id !== experienceId));
  };

  const handleAddEducation = () => {
    if (!newEducation.degree.trim()) return;
    
    const newEdu = {
      id: `edu_${Date.now()}`,
      degree: newEducation.degree.trim(),
      field: newEducation.field,
      school: newEducation.school,
      info: newEducation.info
    };

    setEducation((prev) => [...prev, newEdu]);
    setNewEducation({
      degree: "",
      field: "",
      school: "",
      info: ""
    });
    setShowAddEducation(false);
  };

  const handleDeleteEducation = (educationId) => {
    setEducation((prev) => prev.filter((e) => e.id !== educationId));
  };

  const handleAddResume = async (file) => {
    if (!file) return;
    
    try {
      const data = await uploadResume(file);
      // Use the backend-generated resume ID - don't overwrite with fake ID
      const newResume = data.resume || data;
      setResumes((prev) => [...prev, newResume]);
      setNewResume({ name: "" });
      setUploadSuccess("Resume uploaded successfully!");
      setTimeout(() => setUploadSuccess(""), 3000);
      setShowAddResume(false);
    } catch (error) {
      console.error("Error uploading resume:", error);
      setUploadError(error.message || "Failed to upload resume");
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      console.log("Deleting resume with ID:", resumeId);
      await deleteResume(resumeId);
      setResumes((prev) => prev.filter((resume) => resume.id !== resumeId));
      setUploadSuccess("Resume deleted successfully!");
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting resume:", error);
      setUploadError(error.message || "Failed to delete resume");
    }
  };

  const handleSetDefaultResume = async (resumeId) => {
    try {
      await setDefaultResume(resumeId);
      setResumes((prev) => prev.map((resume) => ({
        ...resume,
        is_default: resume.id === resumeId
      })));
      setUploadSuccess("Default resume set successfully!");
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (error) {
      console.error("Error setting default resume:", error);
      setUploadError(error.message || "Failed to set default resume");
    }
  };

  const toggleRole = (idx) => setRoles((prev) => prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)));
  const toggleLocation = (idx) => setLocations((prev) => prev.map((l, i) => ({ ...l, selected: i === idx })));
  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");
    setIsUploadingAvatar(true);
    try {
      const data = await uploadProfileImage(file);
      setAvatarUrl(getFileUrl(data.avatar_url));
      // Show success message
      setUploadSuccess("Profile image uploaded successfully!");
      setUploadError("");
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (error) {
      console.error("Avatar upload error:", error);
      
      // Provide more specific error messages
      if (error.message.includes("Not authenticated") || error.message.includes("401")) {
        setUploadError("Please log in to upload a profile image");
      } else if (error.message.includes("413") || error.message.includes("too large")) {
        setUploadError("Image file is too large. Please choose a smaller image.");
      } else if (error.message.includes("415") || error.message.includes("image")) {
        setUploadError("Please upload a valid image file (JPG, PNG, etc.)");
      } else {
        setUploadError(error.message || "There was an error uploading your avatar.");
      }
    } finally {
      setIsUploadingAvatar(false);
      // Clear the file input
      e.target.value = "";
      
      // Auto-clear error message after 5 seconds
      if (uploadError) {
        setTimeout(() => setUploadError(""), 5000);
      }
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");
    setIsUploadingResume(true);
    try {
      const data = await uploadResume(file);
      setResumeUrl(data.resume_url || "");

      // Reload resumes, skills, experience, and education from DB since they're populated by the resume upload
      try {
        const [resumesData, skillsData, experienceData, educationData] = await Promise.all([
          getResumes(),
          getSkills(),
          getExperience(),
          getEducation()
        ]);

        // Backend returns arrays directly for skills, experience, education
        // and { resumes: [...] } for resumes
        if (resumesData.resumes) setResumes(resumesData.resumes);
        if (Array.isArray(skillsData)) setSkills(skillsData);
        if (Array.isArray(experienceData)) setExperience(experienceData);
        if (Array.isArray(educationData)) setEducation(educationData);
      } catch (error) {
        console.error("Error reloading profile data after resume upload:", error);
      }


      setUploadSuccess("Resume uploaded successfully!" + (data.parsed_data ? " Parsed data added to profile." : ""));
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (error) {
      console.error("Resume upload error:", error);
      setUploadError(error.message || "There was an error uploading your resume.");
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
    }
  };

  const inputStyle = {
    backgroundColor: "#ffffff", border: "2px solid #000000", padding: "10px",
    fontWeight: 500, outline: "none", fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.875rem", color: "#111827", width: "100%", borderRadius: 0,
    transition: "box-shadow 0.15s ease",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        .profile-body { font-family: 'Space Grotesk', sans-serif; background-color: #F9FAFB; color: #111827; }
        .profile-body h1, .profile-body h2, .profile-body h3 { font-family: 'Syne', sans-serif; text-transform: uppercase; }

        ::selection { background-color: #D8B4FE; color: #000; }

        .neo-input:focus { box-shadow: 2px 2px 0px 0px #1A4D2E; border-color: #1A4D2E; }

        .section-card { background-color: #ffffff; border: 2px solid #000000; padding: 24px; box-shadow: 4px 4px 0px 0px #000000; }

        .skill-tag {
          display: flex; align-items: center; justify-content: space-between;
          background-color: #F3E8FF; border: 2px solid #000000;
          padding: 12px; box-shadow: 2px 2px 0px 0px #000000;
        }

        .icon-btn {
          padding: 6px; border: 2px solid #000000; background: transparent;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background-color 0.15s ease;
        }
        .icon-btn:hover { background-color: #f3f4f6; }
        .icon-btn-danger:hover { background-color: #fef2f2; color: #b91c1c; }

        @media (max-width: 768px) {
          .section-grid-2 { grid-template-columns: 1fr !important; }
          .section-grid-3 { grid-template-columns: 1fr !important; }
          .basic-grid { grid-template-columns: 1fr !important; }
          .resume-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="profile-body" style={{ display: "flex", flex: 1, minHeight: "100vh" }}>
        {/* â”€â”€ Main â”€â”€ */}
        <main style={{ flex: 1, padding: "32px", paddingBottom: "100px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Page Header */}
            <div style={{ marginBottom: "40px" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#111827", lineHeight: 1.1, marginBottom: "16px" }}>
                Professional Blueprint
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "400px" }}>
                <div style={{ flex: 1, height: "16px", backgroundColor: "#e5e7eb", border: "2px solid #000000", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "#1A4D2E", width: `${profileCompletion}%`, borderRight: "2px solid #000000" }} />
                </div>
                <span style={{ fontSize: "1rem", fontWeight: 900, whiteSpace: "nowrap" }}>{profileCompletion}% Complete</span>
              </div>
            </div>

            {/* Success Message - Floating */}
            {uploadSuccess && (
              <div style={{
                position: "fixed",
                bottom: "32px",
                right: "32px",
                backgroundColor: "#f0fdf4",
                border: "2px solid #000000",
                padding: "16px 20px",
                color: "#166534",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                boxShadow: "4px 4px 0px 0px #000000",
                zIndex: 1000,
                animation: "slideIn 0.3s ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>check_circle</span>
                  <span>{uploadSuccess}</span>
                </div>
              </div>
            )}

            {/* Error Message - Floating */}
            {uploadError && (
              <div style={{
                position: "fixed",
                bottom: "32px",
                right: "32px",
                backgroundColor: "#fef2f2",
                border: "2px solid #000000",
                padding: "16px 20px",
                color: "#991b1b",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                boxShadow: "4px 4px 0px 0px #000000",
                zIndex: 1000,
                animation: "slideIn 0.3s ease"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>error</span>
                  <span>{uploadError}</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

              {/* â”€â”€ 01. Basic Information â”€â”€ */}
              <section className="section-card">
                <h2 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "24px", borderBottom: "4px solid #D8B4FE", paddingBottom: "4px", display: "inline-block" }}>
                  01. Basic Information
                </h2>
                
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                    Loading profile data...
                  </div>
                ) : (
                  <div className="basic-grid" style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "32px", alignItems: "start" }}>
                    {/* Photo */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "160px", height: "160px", border: "2px solid #000000", position: "relative", marginBottom: "12px", backgroundColor: "#f3f4f6" }}>
                        <img src={getFileUrl(avatarUrl) || "https://via.placeholder.com/160x160/f3f4f6/6b7280?text=No+Image"} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isUploadingAvatar ? 0.5 : 1 }} />
                        <input type="file" ref={avatarInputRef} style={{ display: "none" }} accept="image/*" onChange={handleAvatarChange} />
                        <button 
                          onClick={() => avatarInputRef.current.click()}
                          disabled={isUploadingAvatar}
                          style={{ position: "absolute", bottom: "-12px", right: "-12px", backgroundColor: "#1A4D2E", color: "#ffffff", border: "2px solid #000000", padding: "8px", boxShadow: "2px 2px 0px 0px #000000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{isUploadingAvatar ? "hourglass_empty" : "edit"}</span>
                        </button>
                      </div>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280" }}>{isUploadingAvatar ? "Uploading..." : "Upload new photo"}</p>
                    </div>

                    {/* Fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {/* First Name */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>First Name</label>
                        <input className="neo-input" style={inputStyle} value={form.first_name} onChange={handleChange("first_name")} placeholder="First name" />
                      </div>

                      {/* Last Name */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>Last Name</label>
                        <input className="neo-input" style={inputStyle} value={form.last_name} onChange={handleChange("last_name")} placeholder="Last name" />
                      </div>

                      {/* Location */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>Location</label>
                        <input className="neo-input" style={inputStyle} value={form.location} onChange={handleChange("location")} placeholder="City, Country" />
                      </div>

                      {/* Portfolio */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>Portfolio</label>
                        <input className="neo-input" style={inputStyle} value={form.portfolio} onChange={handleChange("portfolio")} placeholder="https://yourportfolio.com" />
                      </div>

                      {/* Professional Headline */}
                      <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>Professional Headline</label>
                        <input className="neo-input" style={inputStyle} value={form.headline} onChange={handleChange("headline")} placeholder="e.g. Senior Software Engineer" />
                      </div>

                      {/* LinkedIn */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>LinkedIn Username</label>
                        <input className="neo-input" style={inputStyle} value={form.linkedin} onChange={handleChange("linkedin")} placeholder="username" />
                      </div>

                      {/* GitHub */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>GitHub Username</label>
                        <input className="neo-input" style={inputStyle} value={form.github} onChange={handleChange("github")} placeholder="username" />
                      </div>

                      {/* LeetCode */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "#4b5563" }}>LeetCode Username</label>
                        <input className="neo-input" style={inputStyle} value={form.leetcode} onChange={handleChange("leetcode")} placeholder="username" />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* â”€â”€ 02. Expert Skills â”€â”€ */}
              <section className="section-card">
                <h2 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "24px", borderBottom: "4px solid #FACC15", paddingBottom: "4px", display: "inline-block" }}>
                  02. Expert Skills
                </h2>
                
                {/* Add Skill Form */}
                <div style={{ marginBottom: "24px", padding: "16px", border: "2px solid #000000", backgroundColor: "#FFFBEB" }}>
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase" }}>Add New Skill</h3>
                  <div style={{ display: "flex", gap: "12px", alignItems: "end" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Skill Name</label>
                      <input 
                        className="neo-input" 
                        style={inputStyle}
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="e.g. React, Python, Docker"
                        onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Level</label>
                      <select 
                        className="neo-input" 
                        style={{...inputStyle, cursor: "pointer"}}
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddSkill}
                      disabled={isAddingSkill || !newSkillName.trim()}
                      style={{
                        padding: "10px 20px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        backgroundColor: "#1A4D2E",
                        color: "#ffffff",
                        border: "2px solid #000000",
                        cursor: (isAddingSkill || !newSkillName.trim()) ? "not-allowed" : "pointer",
                        fontSize: "0.75rem",
                        opacity: (isAddingSkill || !newSkillName.trim()) ? 0.5 : 1
                      }}
                    >
                      {isAddingSkill ? "Adding..." : "Add Skill"}
                    </button>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="section-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {skills.map((skill) => (
                    <div key={skill.id} className="skill-tag" style={{
                      backgroundColor: skill.source === "resume" ? "#F3E8FF" : "#E0F2FE",
                      borderColor: skill.source === "resume" ? "#000000" : "#000000"
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, display: "block", textTransform: "uppercase", fontSize: "0.75rem" }}>{skill.name}</span>
                        <span style={{ fontSize: "0.6rem", color: "#1A4D2E", fontWeight: 900, textTransform: "uppercase" }}>{skill.level}</span>
                        <span style={{ fontSize: "0.5rem", color: "#6b7280", fontWeight: 500, textTransform: "uppercase", display: "block", marginTop: "2px" }}>
                          {skill.source === "resume" ? "From Resume" : "Manual"}
                        </span>
                      </div>
                      <button onClick={() => removeSkill(skill.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <div style={{ gridColumn: "span 3", textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>psychology</span>
                      <p style={{ fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>No Skills Yet</p>
                      <p style={{ fontSize: "0.875rem" }}>Add skills manually or upload a resume to extract skills automatically</p>
                    </div>
                  )}
                </div>
              </section>

              {/* â”€â”€ 03. Work Experience â”€â”€ */}
              <section className="section-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "4px solid #D8B4FE", paddingBottom: "4px" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>03. Experience</h2>
                  <button
                    onClick={() => setShowAddExperience(true)}
                    style={{ backgroundColor: "#1A4D2E", color: "#ffffff", border: "2px solid #000000", padding: "6px 16px", fontWeight: 700, boxShadow: "2px 2px 0px 0px #000000", fontSize: "0.75rem", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.15s ease" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                    Add Experience
                  </button>
                </div>
                
                {/* Add Experience Form */}
                {showAddExperience && (
                  <div style={{ marginBottom: "24px", padding: "20px", border: "2px solid #000000", backgroundColor: "#FFFBEB" }}>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase" }}>Add New Experience</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Job Title</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newExperience.title}
                            onChange={(e) => setNewExperience(prev => ({...prev, title: e.target.value}))}
                            placeholder="e.g. Senior Software Engineer"
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Company</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newExperience.company}
                            onChange={(e) => setNewExperience(prev => ({...prev, company: e.target.value}))}
                            placeholder="e.g. Google"
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Location</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newExperience.location}
                            onChange={(e) => setNewExperience(prev => ({...prev, location: e.target.value}))}
                            placeholder="e.g. San Francisco, CA"
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Start Date</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            type="date"
                            value={newExperience.start_date}
                            onChange={(e) => setNewExperience(prev => ({...prev, start_date: e.target.value}))}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>End Date</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            type="date"
                            value={newExperience.end_date || ""}
                            onChange={(e) => setNewExperience(prev => ({...prev, end_date: e.target.value || null}))}
                            disabled={newExperience.current}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Current Job</label>
                          <select 
                            className="neo-input" 
                            style={{...inputStyle, cursor: "pointer"}}
                            value={newExperience.current}
                            onChange={(e) => setNewExperience(prev => ({...prev, current: e.target.value === "true"}))}
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Description</label>
                        <textarea 
                          className="neo-input" 
                          style={{...inputStyle, minHeight: "100px", resize: "vertical"}}
                          value={newExperience.description.join("\n")}
                          onChange={(e) => setNewExperience(prev => ({...prev, description: e.target.value.split("\n")}))}
                          placeholder="â€¢ Led development of microservices architecture&#10;â€¢ Reduced API response time by 40%"
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setShowAddExperience(false)}
                        style={{
                          padding: "10px 20px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor: "#6b7280",
                          color: "#ffffff",
                          border: "2px solid #000000",
                          cursor: "pointer",
                          fontSize: "0.75rem"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddExperience}
                        disabled={!newExperience.title.trim()}
                        style={{
                          padding: "10px 20px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor: "#1A4D2E",
                          color: "#ffffff",
                          border: "2px solid #000000",
                          cursor: newExperience.title.trim() ? "pointer" : "not-allowed",
                          fontSize: "0.75rem",
                          opacity: newExperience.title.trim() ? 1 : 0.5
                        }}
                      >
                        Add Experience
                      </button>
                    </div>
                  </div>
                )}

                {/* Experience List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {experience.map((exp) => (
                    <div key={exp.id} style={{ border: "2px solid #000000", padding: "20px", backgroundColor: exp.source === "resume" ? "#F3E8FF" : "#F9FAFB", position: "relative" }}>
                      {exp.current && (
                        <div style={{ position: "absolute", top: "-10px", left: "-2px", backgroundColor: "#DCFCE7", color: "#14532D", padding: "2px 10px", fontWeight: 900, fontSize: "0.6rem", textTransform: "uppercase", border: "2px solid #000000" }}>
                          Current
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div>
                          <h3 style={{ fontSize: "1rem", fontWeight: 900 }}>{exp.title}</h3>
                          <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1A4D2E" }}>{exp.company}</p>
                          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginTop: "2px" }}>
                            {exp.start_date} {exp.current ? "â€” Present" : `â€” ${exp.end_date}`}
                          </p>
                          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", marginTop: "2px" }}>{exp.location}</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="icon-btn" style={{ fontSize: "12px", padding: "6px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                          </button>
                          <button className="icon-btn icon-btn-danger" onClick={() => handleDeleteExperience(exp.id)} style={{ fontSize: "12px", padding: "6px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                          </button>
                        </div>
                      </div>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {exp.description.map((b, i) => (
                          <li key={i} style={{ display: "flex", gap: "10px", fontWeight: 500, fontSize: "0.85rem", color: "#374151" }}>
                            <span style={{ color: "#1A4D2E", fontWeight: 900, marginTop: "2px" }}>â†’</span>
                            <span style={{ lineHeight: 1.5 }}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {experience.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>work</span>
                      <p style={{ fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>No Experience Yet</p>
                      <p style={{ fontSize: "0.875rem" }}>Add your work experience manually or upload a resume to extract experience automatically</p>
                    </div>
                  )}
                </div>
              </section>

              {/* ── 04. Education ── */}
              <section className="section-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "4px solid #1A4D2E", paddingBottom: "4px" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>04. Education</h2>
                  <button
                    onClick={() => setShowAddEducation(true)}
                    style={{ backgroundColor: "#1A4D2E", color: "#ffffff", border: "2px solid #000000", padding: "6px 16px", fontWeight: 700, boxShadow: "2px 2px 0px 0px #000000", fontSize: "0.75rem", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.15s ease" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                    Add Education
                  </button>
                </div>
                
                {/* Add Education Form */}
                {showAddEducation && (
                  <div style={{ marginBottom: "24px", padding: "20px", border: "2px solid #000000", backgroundColor: "#FFFBEB" }}>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "16px", textTransform: "uppercase" }}>Add New Education</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Degree</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newEducation.degree}
                            onChange={(e) => setNewEducation(prev => ({...prev, degree: e.target.value}))}
                            placeholder="e.g. Master's Degree"
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Field</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newEducation.field}
                            onChange={(e) => setNewEducation(prev => ({...prev, field: e.target.value}))}
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>School</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newEducation.school}
                            onChange={(e) => setNewEducation(prev => ({...prev, school: e.target.value}))}
                            placeholder="e.g. Stanford University"
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>Info</label>
                          <input 
                            className="neo-input" 
                            style={inputStyle}
                            value={newEducation.info}
                            onChange={(e) => setNewEducation(prev => ({...prev, info: e.target.value}))}
                            placeholder="e.g. Class of 2018 • GPA 3.9/4.0"
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setShowAddEducation(false)}
                        style={{
                          padding: "10px 20px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor: "#6b7280",
                          color: "#ffffff",
                          border: "2px solid #000000",
                          cursor: "pointer",
                          fontSize: "0.75rem"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEducation}
                        disabled={!newEducation.degree.trim()}
                        style={{
                          padding: "10px 20px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor: "#1A4D2E",
                          color: "#ffffff",
                          border: "2px solid #000000",
                          cursor: newEducation.degree.trim() ? "pointer" : "not-allowed",
                          fontSize: "0.75rem",
                          opacity: newEducation.degree.trim() ? 1 : 0.5
                        }}
                      >
                        Add Education
                      </button>
                    </div>
                  </div>
                )}

                {/* Education List */}
                <div className="section-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {education.map((edu) => (
                    <div key={edu.id} style={{ border: "2px solid #000000", padding: "20px", backgroundColor: edu.source === "resume" ? "#F3E8FF" : "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "2px 2px 0px 0px #000000", position: "relative" }}>
                      <button onClick={() => handleDeleteEducation(edu.id)} style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
                      </button>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{ backgroundColor: edu.source === "resume" ? "#F3E8FF" : "#E0F2FE", color: "#3B0764", border: "2px solid #000", padding: "2px 8px", fontWeight: 900, fontSize: "0.6rem", textTransform: "uppercase" }}>{edu.degree}</span>
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280" }}>{edu.source === "resume" ? "From Resume" : "Manual"}</span>
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 900 }}>{edu.field}</h3>
                        <p style={{ fontWeight: 500, fontSize: "0.85rem", color: "#4b5563" }}>{edu.school}</p>
                      </div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginTop: "16px", letterSpacing: "0.05em" }}>{edu.info}</p>
                    </div>
                  ))}
                  {education.length === 0 && (
                    <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>school</span>
                      <p style={{ fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>No Education Yet</p>
                      <p style={{ fontSize: "0.875rem" }}>Add your education manually or upload a resume to extract education automatically</p>
                    </div>
                  )}
                </div>
              </section>

              {/* ── 05. Preferences ── */}
              <section className="section-card">
                <h2 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "24px", borderBottom: "4px solid #FACC15", paddingBottom: "4px", display: "inline-block" }}>
                  05. Preferences
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Employment Types */}
                  <div>
                    <label style={{ display: "block", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", marginBottom: "12px", color: "#4b5563", letterSpacing: "0.05em" }}>Employment Types</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      {["Full-time", "Contract", "Part-time", "Internship"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            const updated = preferences.employment_types?.includes(type)
                              ? preferences.employment_types.filter(t => t !== type)
                              : [...(preferences.employment_types || []), type];
                            setPreferences(prev => ({ ...prev, employment_types: updated }));
                          }}
                          style={{
                            padding: "6px 16px",
                            border: "2px solid #000000",
                            backgroundColor: preferences.employment_types?.includes(type) ? "#D8B4FE" : "#ffffff",
                            fontWeight: 700,
                            boxShadow: preferences.employment_types?.includes(type) ? "2px 2px 0px 0px #000000" : "none",
                            cursor: "pointer",
                            transition: "all 0.1s ease",
                            fontSize: "0.75rem"
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remote Preference */}
                  <div>
                    <label style={{ display: "block", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", marginBottom: "12px", color: "#4b5563", letterSpacing: "0.05em" }}>Work Preference</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                      {["Remote", "Hybrid", "On-site"].map((pref) => (
                        <div
                          key={pref}
                          onClick={() => setPreferences(prev => ({ ...prev, remote_preference: pref.toLowerCase() }))}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px",
                            border: "2px solid #000000",
                            backgroundColor: preferences.remote_preference === pref.toLowerCase() ? "#f4fdf8" : "#ffffff",
                            cursor: "pointer",
                            transition: "all 0.1s ease"
                          }}
                        >
                          <div style={{ width: "16px", height: "16px", border: "2px solid #000000", backgroundColor: preferences.remote_preference === pref.toLowerCase() ? "#1A4D2E" : "#ffffff", flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", opacity: preferences.remote_preference === pref.toLowerCase() ? 1 : 0.6 }}>{pref}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range - Slider */}
                  <div>
                    <label style={{ display: "block", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", marginBottom: "12px", color: "#4b5563", letterSpacing: "0.05em" }}>Salary Range (₹/year)</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, color: "#1a1a1a" }}>
                        <span>₹{(salaryRange.min / 100000).toFixed(1)}L</span>
                        <span>₹{(salaryRange.max / 100000).toFixed(1)}L</span>
                      </div>
                      <div style={{ position: "relative", height: "40px" }}>
                        <input
                          type="range"
                          min="300000"
                          max="5000000"
                          step="100000"
                          value={salaryRange.min}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value);
                            setSalaryRange(prev => ({ ...prev, min: Math.min(newMin, prev.max - 100000) }));
                            setPreferences(prev => ({ ...prev, target_salary_min: newMin }));
                          }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            pointerEvents: "none",
                            WebkitAppearance: "none",
                            height: "6px",
                            background: "#e5e7eb",
                            borderRadius: "3px",
                            zIndex: 1
                          }}
                        />
                        <input
                          type="range"
                          min="300000"
                          max="5000000"
                          step="100000"
                          value={salaryRange.max}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value);
                            setSalaryRange(prev => ({ ...prev, max: Math.max(newMax, prev.min + 100000) }));
                            setPreferences(prev => ({ ...prev, target_salary_max: newMax }));
                          }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            pointerEvents: "none",
                            WebkitAppearance: "none",
                            height: "6px",
                            background: "transparent",
                            borderRadius: "3px",
                            zIndex: 2
                          }}
                        />
                        <style>{`
                          input[type="range"]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #1A4D2E;
                            border: 2px solid #000000;
                            cursor: pointer;
                            pointer-events: auto;
                            position: relative;
                            z-index: 3;
                          }
                          input[type="range"]::-moz-range-thumb {
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: #1A4D2E;
                            border: 2px solid #000000;
                            cursor: pointer;
                            pointer-events: auto;
                            position: relative;
                            z-index: 3;
                          }
                        `}</style>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <label style={{ display: "block", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", marginBottom: "12px", color: "#4b5563", letterSpacing: "0.05em" }}>Preferred Locations (Indian IT Hubs)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                      {preferences.preferred_locations?.map((loc, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "4px 12px",
                            backgroundColor: "#F3E8FF",
                            border: "2px solid #000000",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          {loc}
                          <button
                            onClick={() => {
                              const updated = preferences.preferred_locations.filter((_, idx) => idx !== i);
                              setPreferences(prev => ({ ...prev, preferred_locations: updated }));
                            }}
                            style={{ padding: "0", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px" }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                        style={{
                          padding: "8px 16px",
                          border: "2px solid #000000",
                          backgroundColor: "#ffffff",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "2px 2px 0px 0px #000000"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_location</span>
                        Add Location
                      </button>
                      {showLocationDropdown && (
                        <div style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: "8px",
                          backgroundColor: "#ffffff",
                          border: "2px solid #000000",
                          boxShadow: "4px 4px 0px 0px #000000",
                          zIndex: 100,
                          maxHeight: "300px",
                          overflowY: "auto",
                          minWidth: "200px"
                        }}>
                          {indianITLocations.map((loc) => (
                            <div
                              key={loc}
                              onClick={() => {
                                if (!preferences.preferred_locations?.includes(loc)) {
                                  setPreferences(prev => ({
                                    ...prev,
                                    preferred_locations: [...(prev.preferred_locations || []), loc]
                                  }));
                                }
                                setShowLocationDropdown(false);
                              }}
                              style={{
                                padding: "10px 16px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                borderBottom: "1px solid #e5e7eb",
                                backgroundColor: preferences.preferred_locations?.includes(loc) ? "#F3E8FF" : "#ffffff",
                                transition: "background-color 0.15s ease"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = preferences.preferred_locations?.includes(loc) ? "#F3E8FF" : "#f3f4f6"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = preferences.preferred_locations?.includes(loc) ? "#F3E8FF" : "#ffffff"}
                            >
                              {loc}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Open to Relocation */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      onClick={() => setPreferences(prev => ({ ...prev, open_to_relocation: !prev.open_to_relocation }))}
                      style={{ width: "20px", height: "20px", border: "2px solid #000000", backgroundColor: preferences.open_to_relocation ? "#1A4D2E" : "#ffffff", cursor: "pointer", flexShrink: 0 }}
                    />
                    <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", color: "#4b5563", cursor: "pointer" }} onClick={() => setPreferences(prev => ({ ...prev, open_to_relocation: !prev.open_to_relocation }))}>
                  Open to Relocation
                </label>
                  </div>

                  {/* Notice Period */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", color: "#4b5563" }}>Notice Period</label>
                    <select
                      className="neo-input"
                      style={{ ...inputStyle, cursor: "pointer" }}
                      value={preferences.notice_period || ""}
                      onChange={(e) => setPreferences(prev => ({ ...prev, notice_period: e.target.value || null }))}
                    >
                      <option value="">Select notice period</option>
                      <option value="Immediate">Immediate</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* ── 06. Resumes ── */}
              <section className="section-card">
                <h2 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "24px", borderBottom: "4px solid #D8B4FE", paddingBottom: "4px", display: "inline-block" }}>
                  06. Resumes
                </h2>
                <div className="resume-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                  {/* Upload zone */}
                  <div
                    style={{ border: "2px dashed #000000", backgroundColor: "#F9FAFB", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", transition: "background-color 0.15s ease", height: "100%" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFFBEB")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                    onClick={() => !isUploadingResume && resumeInputRef.current?.click()}
                  >
                    <input type="file" ref={resumeInputRef} style={{ display: "none" }} accept=".pdf,.docx" onChange={handleResumeChange} />
                    <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", marginBottom: "12px", color: "#1A4D2E" }}>cloud_upload</span>
                    <p style={{ fontWeight: 900, textTransform: "uppercase", marginBottom: "6px", fontSize: "0.85rem" }}>{isUploadingResume ? "Uploading Resume..." : "Drop your CV here"}</p>
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>PDF, DOCX up to 10MB</p>
                    <button disabled={isUploadingResume} style={{ marginTop: "16px", padding: "6px 20px", backgroundColor: "#ffffff", color: "#111", fontWeight: 700, border: "2px solid #000000", boxShadow: "2px 2px 0px 0px #000000", fontSize: "0.7rem", textTransform: "uppercase", cursor: isUploadingResume ? "not-allowed" : "pointer", transition: "transform 0.1s ease", opacity: isUploadingResume ? 0.7 : 1 }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px, 2px)", e.currentTarget.style.boxShadow = "none")}
                      onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0px, 0px)", e.currentTarget.style.boxShadow = "2px 2px 0px 0px #000000")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploadingResume) {
                          resumeInputRef.current?.click();
                        }
                      }}
                    >
                      Browse
                    </button>
                  </div>

                  {/* Resume list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {resumes.map((resume) => (
                      <div key={resume.id} style={{ border: "2px solid #000000", padding: "12px 16px", backgroundColor: resume.is_default ? "#ffffff" : "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: resume.is_default ? "2px 2px 0px 0px #000000" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: resume.is_default ? 1 : 0.7 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "24px", color: resume.is_default ? "#1A4D2E" : "#6b7280" }}>description</span>
                          <div>
                            <p style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", marginBottom: "2px" }}>{resume.filename || resume.name}</p>
                            <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: resume.is_default ? "#D8B4FE" : "#9ca3af" }}>{resume.is_default ? "Default Resume" : resume.uploaded_at || resume.date}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            onClick={() => setUploadError("File not found")} 
                            style={{ padding: "4px 8px", border: "2px solid #000000", fontWeight: 700, fontSize: "0.6rem", textTransform: "uppercase", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                          </button>
                          {!resume.is_default && (
                            <button onClick={() => handleSetDefaultResume(resume.id)} style={{ padding: "4px 8px", border: "2px solid #000000", fontWeight: 700, fontSize: "0.6rem", textTransform: "uppercase", background: "transparent", cursor: "pointer" }}>Set Default</button>
                          )}
                          <button className="icon-btn icon-btn-danger" onClick={() => handleDeleteResume(resume.id)} style={{ padding: "4px", border: "none", background: "transparent", cursor: "pointer" }}><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span></button>
                        </div>
                      </div>
                    ))}
                    {resumes.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>description</span>
                        <p style={{ fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>No Resumes Yet</p>
                        <p style={{ fontSize: "0.875rem" }}>Upload your resume (max 3 resumes, oldest will be auto-deleted)</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
            
            {/* â”€â”€ Actions â”€â”€ */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "40px" }}>
              <button
                onMouseEnter={() => setDiscardHover(true)}
                onMouseLeave={() => setDiscardHover(false)}
                disabled={saving}
                style={{ padding: "10px 24px", fontWeight: 700, textTransform: "uppercase", border: "2px solid #000000", backgroundColor: discardHover ? "#f3f4f6" : "transparent", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.75rem", transition: "background-color 0.15s ease", opacity: saving ? 0.5 : 1 }}
              >
                Discard
              </button>
              <button
                onMouseEnter={() => !saving && setSaveHover(true)}
                onMouseLeave={() => setSaveHover(false)}
                onClick={handleSaveProfile}
                disabled={saving || loading}
                style={{ padding: "10px 32px", fontWeight: 700, textTransform: "uppercase", backgroundColor: "#1A4D2E", color: "#ffffff", border: "2px solid #000000", boxShadow: saveHover ? "none" : "3px 3px 0px 0px #000000", transform: saveHover ? "translate(3px,3px)" : "translate(0,0)", cursor: (saving || loading) ? "not-allowed" : "pointer", fontSize: "0.75rem", transition: "all 0.15s ease", opacity: (saving || loading) ? 0.5 : 1 }}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
