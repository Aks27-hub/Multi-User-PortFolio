import { useState, useEffect } from "react";
import {
  User as UserIcon,
  FolderOpen,
  Briefcase,
  Plus,
  Trash2,
  Copy,
  Check,
  LogOut,
  Globe,
  Eye,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { api } from "../api.js";

export default function Dashboard({ user, onLogout, onNavigate }) {
  // Live states
  const [profile, setProfile] = useState({
    full_name: user.username,
    title: "",
    bio: "",
    avatar_url: "",
    github_url: "",
    linkedin_url: "",
    email_contact: user.email,
  });

  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);

  // UI tabs and forms
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // New item inputs
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    role: "",
    technologies: "",
    live_url: "",
    github_url: "",
  });
  const [addingProject, setAddingProject] = useState(false);
  const [projectError, setProjectError] = useState(null);

  const [newExperience, setNewExperience] = useState({
    company: "",
    role: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [addingExperience, setAddingExperience] = useState(false);
  const [experienceError, setExperienceError] = useState(null);

  // Copy URL state
  const [copied, setCopied] = useState(false);

  // Load all user portfolio data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Profile
        try {
          const profileData = await api.getProfile();
          if (profileData) {
            setProfile({
              full_name: profileData.full_name || user.username,
              title: profileData.title || "",
              bio: profileData.bio || "",
              avatar_url: profileData.avatar_url || "",
              github_url: profileData.github_url || "",
              linkedin_url: profileData.linkedin_url || "",
              email_contact: profileData.email_contact || user.email,
            });
          }
        } catch (e) {
          console.log("No profile found yet, using default template.");
        }

        // Load Projects
        const projectsData = await api.getProjects();
        setProjects(projectsData || []);

        // Load Experiences
        const experiencesData = await api.getExperiences();
        setExperiences(experiencesData || []);
      } catch (err) {
        console.error("Failed to load portfolio items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Handle profile updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      await api.upsertProfile(profile);
      setProfileMessage({ type: "success", text: "Profile details saved successfully!" });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle project additions
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) {
      setProjectError("Project title is required.");
      return;
    }

    setAddingProject(true);
    setProjectError(null);

    try {
      const response = await api.createProject(newProject);
      setProjects([{ ...newProject, id: response.projectId }, ...projects]);
      // Reset form
      setNewProject({
        title: "",
        description: "",
        role: "",
        technologies: "",
        live_url: "",
        github_url: "",
      });
    } catch (err) {
      setProjectError(err.message || "Failed to save project.");
    } finally {
      setAddingProject(false);
    }
  };

  // Handle project deletions
  const handleDeleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete project.");
    }
  };

  // Handle experience additions
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExperience.company || !newExperience.role) {
      setExperienceError("Company and role are required.");
      return;
    }

    setAddingExperience(true);
    setExperienceError(null);

    try {
      const response = await api.createExperience(newExperience);
      setExperiences([{ ...newExperience, id: response.experienceId }, ...experiences]);
      // Reset form
      setNewExperience({
        company: "",
        role: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    } catch (err) {
      setExperienceError(err.message || "Failed to save experience.");
    } finally {
      setAddingExperience(false);
    }
  };

  // Handle experience deletions
  const handleDeleteExperience = async (id) => {
    if (!confirm("Are you sure you want to delete this work experience?")) return;
    try {
      await api.deleteExperience(id);
      setExperiences(experiences.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete experience.");
    }
  };

  // Public URL generation
  const publicUrl = `${window.location.origin}/${user.username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Control Navigation Header with Slate & Indigo Gradient */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white border-b border-indigo-950 shrink-0 shadow-lg shadow-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20 animate-pulse">
              P
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-sm md:text-base bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">Portfolio Builder</span>
              <span className="hidden sm:inline-block text-xs text-indigo-300 ml-2 border-l border-slate-800 pl-2 font-medium">
                Logged in as @{user.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Quick Link Generator */}
            <div className="hidden lg:flex items-center bg-slate-900/60 text-xs px-3 py-1.5 rounded-lg gap-2 border border-slate-800 max-w-xs overflow-hidden">
              <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-300 truncate select-all">{publicUrl}</span>
              <button
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => onNavigate(`/${user.username}`)}
              className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-slate-100 hover:text-white font-bold text-xs py-2 px-3 rounded-xl transition-all border border-indigo-500/30 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Public</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-300 hover:text-red-200 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-red-900/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Copy link warning alert bar for small devices */}
      <div className="lg:hidden bg-indigo-950 text-indigo-200 border-b border-indigo-900/40 px-4 py-2 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden py-1">
          <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="truncate text-slate-300">{publicUrl}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 bg-indigo-900 px-2.5 py-1 rounded-lg text-white font-semibold shrink-0 hover:bg-indigo-800 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copied" : "Copy Link"}</span>
        </button>
      </div>

      {/* Two-Pane Workspace Layout */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: Controls & Edit Forms (Scrollable) */}
        <div className="w-full md:w-1/2 lg:w-5/12 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          {/* Builder Tabs Selector with active indigo borders */}
          <div className="flex border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10 shrink-0">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4.5 px-2 text-xs md:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                activeTab === "profile"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>1. Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`flex-1 py-4.5 px-2 text-xs md:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                activeTab === "experience"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>2. Experience</span>
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex-1 py-4.5 px-2 text-xs md:text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                activeTab === "projects"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>3. Projects</span>
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-8 flex-grow">
            {/* TAB 1: PROFILE DETAILS FORM */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Personal Branding</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Describe yourself and define how clients can reach out to you.
                  </p>
                </div>

                {profileMessage && (
                  <div
                    className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                      profileMessage.type === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${profileMessage.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      placeholder="Senior Full Stack Software Engineer"
                      value={profile.title || ""}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Biography / Summary
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write a brief professional bio highlighting your key values, experience, and passions..."
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar_url || ""}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm placeholder-slate-400 bg-slate-50/50 focus:bg-white transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">Leave empty to use a beautifully styled default avatar initial.</p>
                  </div>

                  <div className="border-t border-slate-100 pt-5 mt-5">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Contact & Links</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Email</label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={profile.email_contact || ""}
                          onChange={(e) => setProfile({ ...profile, email_contact: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">GitHub URL / Username</label>
                        <input
                          type="text"
                          placeholder="github.com/username"
                          value={profile.github_url || ""}
                          onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn URL / Username</label>
                        <input
                          type="text"
                          placeholder="linkedin.com/in/username"
                          value={profile.linkedin_url || ""}
                          onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm bg-slate-50/50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed mt-6 text-sm cursor-pointer"
                  >
                    {savingProfile ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Save Profile Details</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: WORK EXPERIENCE FORM */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Work History</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Log your professional roles and responsibilities to create a structured timeline.
                  </p>
                </div>

                {experienceError && (
                  <div className="p-4 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{experienceError}</span>
                  </div>
                )}

                {/* Add Experience Form */}
                <form onSubmit={handleAddExperience} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200/50 pb-2.5 mb-2">
                    <Plus className="w-4 h-4 text-indigo-600 animate-bounce" />
                    <span>Log New Experience</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Google, Acme Corp"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Role *</label>
                      <input
                        type="text"
                        required
                        placeholder="Lead Engineer, Product Designer"
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
                      <input
                        type="text"
                        placeholder="Jan 2024 or 2024-01"
                        value={newExperience.start_date || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
                      <input
                        type="text"
                        placeholder="Present or Jun 2026"
                        value={newExperience.end_date || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Description & Key Accomplishments</label>
                      <textarea
                        rows={3}
                        placeholder="- Built high-performance microservices...&#10;- Coordinated with multidisciplinary teams..."
                        value={newExperience.description || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addingExperience}
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all text-sm disabled:from-slate-400 disabled:to-slate-500 cursor-pointer"
                  >
                    {addingExperience ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Experience Card</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Experience List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Current Experiences ({experiences.length})</h3>
                  
                  {experiences.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-250 rounded-2xl text-slate-400 text-sm">
                      No experiences logged yet. Fill the form above to add one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="p-4 bg-white border border-slate-200/70 rounded-xl flex items-start justify-between gap-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/10 transition-all group">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{exp.role}</h4>
                            <p className="text-xs font-bold text-slate-600 truncate">{exp.company}</p>
                            <p className="text-[11px] text-indigo-600 font-semibold mt-1 bg-indigo-50/50 border border-indigo-100/30 px-2 py-0.5 rounded-md inline-block font-mono">{exp.start_date} – {exp.end_date || "Present"}</p>
                          </div>
                          <button
                            onClick={() => exp.id && handleDeleteExperience(exp.id)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 hover:border-rose-100 rounded-lg transition-colors shrink-0"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PROJECTS FORM */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Featured Projects</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Display your engineering creations with links to live demonstrations and GitHub repositories.
                  </p>
                </div>

                {projectError && (
                  <div className="p-4 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{projectError}</span>
                  </div>
                )}

                {/* Add Project Form */}
                <form onSubmit={handleAddProject} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200/50 pb-2.5 mb-2">
                    <Plus className="w-4 h-4 text-indigo-600 animate-bounce" />
                    <span>Post New Project</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="E-Commerce Engine, SaaS Dashboard"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role / Contribution</label>
                      <input
                        type="text"
                        placeholder="Solo Developer, Front-end Lead"
                        value={newProject.role || ""}
                        onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe what the project accomplishes, the problems it solves, and its scale..."
                        value={newProject.description || ""}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Technologies Used</label>
                      <input
                        type="text"
                        placeholder="React, JavaScript, Express, MySQL, Tailwind"
                        value={newProject.technologies || ""}
                        onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">Comma-separated values.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Live Demo URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={newProject.live_url || ""}
                        onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Source GitHub URL</label>
                      <input
                        type="text"
                        placeholder="https://github.com/..."
                        value={newProject.github_url || ""}
                        onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addingProject}
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all text-sm disabled:from-slate-400 disabled:to-slate-500 cursor-pointer"
                  >
                    {addingProject ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Post Project Card</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Projects List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Current Projects ({projects.length})</h3>
                  
                  {projects.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-250 rounded-2xl text-slate-400 text-sm">
                      No projects posted yet. Fill the form above to add one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <div key={proj.id} className="p-4 bg-white border border-slate-200/70 rounded-xl flex items-start justify-between gap-4 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/10 transition-all group">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{proj.title}</h4>
                            {proj.role && <p className="text-xs font-bold text-slate-500 truncate">{proj.role}</p>}
                            {proj.technologies && (
                              <p className="text-[11px] text-slate-400 mt-1 truncate font-mono bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded-md inline-block">{proj.technologies}</p>
                            )}
                          </div>
                          <button
                            onClick={() => proj.id && handleDeleteProject(proj.id)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 hover:border-rose-100 rounded-lg transition-colors shrink-0"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW PANELS */}
        <div className="hidden md:block md:w-1/2 lg:w-7/12 bg-slate-100 p-6 flex flex-col h-full overflow-y-auto">
          {/* Preview banner/header */}
          <div className="flex items-center justify-between mb-4 shrink-0 px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace Preview
            </span>
            <div className="text-[10px] text-slate-400 font-mono bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-md">
              Updates in real-time
            </div>
          </div>

          {/* Interactive Web Preview Simulator */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex-grow overflow-hidden flex flex-col">
            {/* Mock browser chrome */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-400 text-xs font-mono truncate flex items-center justify-between">
                <span>{publicUrl}</span>
                <Globe className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            {/* Simulated Live Webpage Content */}
            <div className="flex-grow overflow-y-auto bg-white text-slate-900 selection:bg-indigo-600 selection:text-white p-6 relative font-sans">
              {/* Mock Header Navigation */}
              <div className="border-b border-slate-100 pb-4 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs">
                    {profile.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="font-extrabold text-xs text-slate-950">{profile.full_name || "Your Full Name"}</span>
                </div>
                <div className="flex gap-4 text-[10px] font-bold text-slate-500">
                  <span className="hover:text-indigo-600 transition-colors">Experience</span>
                  <span className="hover:text-indigo-600 transition-colors">Projects</span>
                </div>
              </div>

              {/* Mock Hero Banner */}
              <div className="text-center py-6 border-b border-slate-50 bg-gradient-to-b from-indigo-50/20 to-transparent rounded-xl mb-4 p-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Preview Avatar"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-white shadow-md ring-2 ring-indigo-50"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {profile.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                
                <h3 className="text-xl font-black tracking-tight text-slate-900">
                  {profile.full_name || "Your Name"}
                </h3>
                <p className="text-xs font-bold text-indigo-600 mt-1">
                  {profile.title || "Your Professional Subheading"}
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-3 leading-relaxed">
                  {profile.bio || "Provide a summary bio inside the details form to make your portfolio pop!"}
                </p>

                {/* Social links */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {profile.email_contact && (
                    <span className="p-1.5 bg-white border border-slate-200 text-slate-650 rounded-lg hover:text-indigo-600 transition-colors" title="Email Contact">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {profile.github_url && (
                    <span className="p-1.5 bg-white border border-slate-200 text-slate-650 rounded-lg hover:text-indigo-600 transition-colors" title="GitHub">
                      <Github className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {profile.linkedin_url && (
                    <span className="p-1.5 bg-white border border-slate-200 text-slate-650 rounded-lg hover:text-indigo-600 transition-colors" title="LinkedIn">
                      <Linkedin className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Mock Timeline Experiences */}
              <div className="py-6 border-b border-slate-50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                  <div className="p-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded">
                    <Briefcase className="w-3 h-3" />
                  </div>
                  <span>Experience</span>
                </h4>

                {experiences.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl text-slate-400 text-[10px] font-sans border border-dashed border-slate-200">
                    Your timeline will render here. Log a work experience inside the "2. Experience" tab to preview it.
                  </div>
                ) : (
                  <div className="border-l-2 border-indigo-100 pl-4 ml-2.5 space-y-5">
                    {experiences.map((exp, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-1 bg-white border-2 border-indigo-600 rounded-full w-2.5 h-2.5 shadow-sm" />
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="text-[11px] font-extrabold text-slate-900 hover:text-indigo-600 transition-colors">{exp.role}</h5>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100/30 shrink-0 font-mono">
                            {exp.start_date} - {exp.end_date || "Present"}
                          </span>
                        </div>
                        <h6 className="text-[10px] font-semibold text-slate-500 mt-0.5">{exp.company}</h6>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mock Projects Grid */}
              <div className="py-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                  <div className="p-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded">
                    <FolderOpen className="w-3 h-3" />
                  </div>
                  <span>Projects</span>
                </h4>

                {projects.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl text-slate-400 text-[10px] font-sans border border-dashed border-slate-200">
                    Your projects will show here. Add a project inside the "3. Projects" tab to preview it.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((proj, idx) => {
                      const techArr = proj.technologies ? proj.technologies.split(",").map(t => t.trim()).filter(Boolean) : [];
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
                          <div>
                            <div className="flex justify-between gap-1 items-start">
                              <h5 className="text-[11px] font-extrabold text-slate-900 truncate">{proj.title}</h5>
                              {proj.role && <span className="text-[8px] text-slate-500 bg-slate-50 border border-slate-150 px-1 rounded-md shrink-0">{proj.role}</span>}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">{proj.description}</p>
                            
                            {techArr.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2.5">
                                {techArr.slice(0, 3).map((tech, tIdx) => (
                                  <span key={tIdx} className="text-[8px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded-md font-mono">
                                    {tech}
                                  </span>
                                ))}
                                {techArr.length > 3 && <span className="text-[8px] text-indigo-600 font-bold">+{techArr.length - 3}</span>}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 border-t border-slate-100 pt-2 mt-3 text-[9px] font-bold text-indigo-600">
                            {proj.live_url && <span className="flex items-center gap-0.5 hover:text-indigo-700 transition-colors"><Globe className="w-2.5 h-2.5" /> Demo</span>}
                            {proj.github_url && <span className="flex items-center gap-0.5 hover:text-indigo-700 transition-colors"><Github className="w-2.5 h-2.5" /> Source</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
