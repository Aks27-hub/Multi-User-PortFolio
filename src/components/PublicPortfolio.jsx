import { useState, useEffect } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Briefcase,
  FolderOpen,
  ArrowRight,
  Globe,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { api } from "../api.js";

export default function PublicPortfolio({ username, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPublicData() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getPublicPortfolio(username);
        setData(res);
      } catch (err) {
        console.error("Error loading public portfolio:", err);
        setError(err.message || "Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchPublicData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading @{username}'s portfolio...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Portfolio Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            We couldn't find a portfolio published under <span className="font-semibold text-slate-800">@{username}</span>.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate("/register")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm"
            >
              Claim @{username} & Build Your Portfolio
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
            >
              Sign In to Your Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, projects, experiences } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Banner CTA for guests */}
      <nav className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 flex justify-between items-center max-w-7xl mx-auto rounded-b-xl shadow-md mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Published with <strong className="text-white">Multi-User Portfolio Builder</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("/login")}
            className="hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate("/register")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1"
          >
            <span>Build Yours</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 space-y-12">
        {/* Profile / Hero Section */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-slate-100 shrink-0"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`;
                }}
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-xl shrink-0 ring-4 ring-indigo-50">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Profile Bio */}
            <div className="text-center sm:text-left flex-grow">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                {profile.full_name}
              </h1>
              <p className="text-lg font-bold text-indigo-600 mt-1">
                {profile.title}
              </p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed whitespace-pre-wrap max-w-2xl">
                {profile.bio}
              </p>

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
                {profile.email_contact && (
                  <a
                    href={`mailto:${profile.email_contact}`}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl border border-slate-200/80 transition-all text-xs font-bold"
                  >
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span>{profile.email_contact}</span>
                  </a>
                )}

                {profile.github_url && (
                  <a
                    href={profile.github_url.startsWith("http") ? profile.github_url : `https://${profile.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white px-4 py-2 rounded-xl border border-slate-200/80 transition-all text-xs font-bold"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                )}

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url.startsWith("http") ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white px-4 py-2 rounded-xl border border-slate-200/80 transition-all text-xs font-bold"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Work Experience Section */}
        {experiences && experiences.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Work Experience</h2>
            </div>

            <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-8 my-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative group">
                  <span className="absolute -left-[31px] top-1.5 bg-white border-2 border-indigo-600 rounded-full w-3.5 h-3.5 shadow-sm group-hover:scale-125 transition-transform" />
                  
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {exp.role}
                      </h3>
                      <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold px-3 py-1 rounded-full w-fit">
                        {exp.start_date} – {exp.end_date || "Present"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-600 mb-3">{exp.company}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Projects Section */}
        {projects && projects.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => {
                const techList = proj.technologies ? proj.technologies.split(",").map((t) => t.trim()).filter(Boolean) : [];

                return (
                  <div
                    key={proj.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {proj.title}
                        </h3>
                        {proj.role && (
                          <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg shrink-0 font-medium">
                            {proj.role}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        {proj.description}
                      </p>

                      {techList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {techList.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-slate-50 border border-slate-200/80 text-slate-600 font-mono px-2.5 py-1 rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-bold text-indigo-600">
                      {proj.live_url && (
                        <a
                          href={proj.live_url.startsWith("http") ? proj.live_url : `https://${proj.live_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-indigo-800 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {proj.github_url && (
                        <a
                          href={proj.github_url.startsWith("http") ? proj.github_url : `https://${proj.github_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-indigo-800 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span>Source Code</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} {profile.full_name}. Built with Multi-User Portfolio Builder.</p>
      </footer>
    </div>
  );
}
