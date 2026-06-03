import React, { useState, useEffect } from "react";
import {
  FileText,
  User as UserIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Database,
  FileCode,
  BookOpen,
  Settings,
  Layers,
  Terminal,
  Play,
  Copy,
  ChevronRight,
  UserCheck,
  Search,
  Filter,
  Plus,
  Trash2,
  Lock,
  Globe,
  Shuffle,
  GraduationCap
} from "lucide-react";
import {
  User,
  ReportSubmission,
  DatabaseStats,
  UnitTestResults,
  CompetitorAnalysis
} from "./types";
import { problemStatement, competitors, mysqlSchema, phpFilesList } from "./data";

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab ] = useState<"workspace" | "architecture" | "api" | "tests">("workspace");

  // Authentication Switcher (Simulation of Role validation)
  const [currentUser, setCurrentUser] = useState<User>({
    id: "u-1",
    email: "student@reporthub.edu",
    name: "Jane Doe",
    role: "student",
    classGroup: "INF-2026",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  });

  // Main reports & stats state loaded from full-stack simulation
  const [reports, setReports] = useState<ReportSubmission[]>([]);
  const [stats, setStats] = useState<DatabaseStats>({
    totalSubmissions: 0,
    gradedSubmissions: 0,
    pendingValidation: 0,
    averageGrade: 0,
    totalStudents: 0,
    classGroups: []
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");

  // Submission Form State (Student)
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitCompany, setSubmitCompany] = useState("");
  const [submitFileName, setSubmitFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Grading Form State (Teacher)
  const [selectedReportForGrading, setSelectedReportForGrading] = useState<ReportSubmission | null>(null);
  const [gradeValue, setGradeValue] = useState<number>(15);
  const [feedbackText, setFeedbackText] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [gradeSuccess, setGradeSuccess] = useState("");

  // API Tester Sandbox State
  const [apiEndpoint, setApiEndpoint] = useState<string>("/api/v1/stats");
  const [apiMethod, setApiMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [apiPayload, setApiPayload] = useState<string>("{\n  \"studentId\": \"u-1\",\n  \"title\": \"Rapport IoT & Capteurs\",\n  \"companyName\": \"Telecom Paris\",\n  \"fileName\": \"rapport_iot.pdf\"\n}");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  // Unit Test State
  const [testResults, setTestResults] = useState<UnitTestResults | null>(null);
  const [testsLoading, setTestsLoading] = useState<boolean>(false);

  // PHP File Explorer State
  const [selectedPhpFile, setSelectedPhpFile] = useState(phpFilesList[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch reports and stats from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const repRes = await fetch("/api/v1/reports");
      const repData = await repRes.json();
      setReports(repData.submissions || []);

      const statsRes = await fetch("/api/v1/stats");
      const statsData = await statsRes.json();
      setStats(statsData);
      
      setLoading(false);
    } catch (e) {
      console.error("Error connecting to Express fullstack system:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle User Persona Switch
  const switchUserRole = (userId: string) => {
    const list = [
      { id: "u-1", email: "student@reporthub.edu", name: "Jane Doe", role: "student" as const, classGroup: "INF-2026", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
      { id: "u-3", email: "teacher@reporthub.edu", name: "Prof. Sarah Conner", role: "teacher" as const, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
      { id: "u-5", email: "admin@reporthub.edu", name: "Super Administrator", role: "admin" as const, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" }
    ];
    const match = list.find(u => u.id === userId);
    if (match) {
      setCurrentUser(match);
      // Clear forms
      setFormError("");
      setFormSuccess("");
      setGradeError("");
      setGradeSuccess("");
      setSelectedReportForGrading(null);
    }
  };

  // Handle student report submission
  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // Front-end Form validation rules matching PHP spec requirements
    if (!submitTitle.trim()) {
      setFormError("La validation PHP/JS requiert un titre de rapport valide.");
      return;
    }
    if (!submitCompany.trim()) {
      setFormError("Le nom de l'entreprise d'accueil est obligatoire.");
      return;
    }
    if (!submitFileName) {
      setFormError("Veuillez choisir un fichier pour validation d'upload.");
      return;
    }

    // Strict extension check (Only pdf)
    if (!submitFileName.toLowerCase().endsWith(".pdf")) {
      setFormError("Le framework PHP requiert strictement un fichier au format .PDF pour interopérabilité.");
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          title: submitTitle,
          companyName: submitCompany,
          fileName: submitFileName,
          fileSize: "3.4 MB"
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setFormSuccess(`Fichier ${submitFileName} analysé avec succès par le contrôleur MVC PHP ! SQL INSERT exécuté.`);
        setSubmitTitle("");
        setSubmitCompany("");
        setSubmitFileName("");
        fetchData();
      } else {
        setFormError(resData.error || "Erreur lors de la soumission.");
      }
    } catch (err) {
      setFormError("L'appel API vers le proxy serveur a échoué.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle teacher submission of grade
  const handleGrading = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradeError("");
    setGradeSuccess("");

    if (!selectedReportForGrading) return;

    // Academic Validation Bounds [0 - 20]
    if (gradeValue < 0 || gradeValue > 20 || isNaN(gradeValue)) {
      setGradeError("Hors limites pédagogiques : La note doit être comprise rigoureusement entre 0 et 20.");
      return;
    }

    try {
      const response = await fetch(`/api/v1/reports/${selectedReportForGrading.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: Number(gradeValue),
          feedback: feedbackText || "Excellent travail d'ensemble.",
          gradedBy: currentUser.name
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setGradeSuccess(`La note de ${gradeValue}/20 a été stockée dans la table reports (MySQL PDO).`);
        setSelectedReportForGrading(null);
        setFeedbackText("");
        fetchData();
      } else {
        setGradeError(resData.error || "Une erreur est survenue lors de l'attribution de la note.");
      }
    } catch (err) {
      setGradeError("L'appel API vers l'abstraction PDO a échoué.");
    }
  };

  // Delete a submission (Admin privileges simulation)
  const handleDeleteSubmission = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cette soumission (DELETE SQL via PDO) ?")) {
      try {
        const response = await fetch(`/api/v1/reports/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchData();
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  // Live sandbox API simulation
  const handleApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: { "Content-Type": "application/json" }
      };
      
      if (apiMethod !== "GET" && apiPayload) {
        options.body = apiPayload;
      }

      const response = await fetch(apiEndpoint, options);
      const data = await response.json();
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        headers: { "Content-Type": "application/json" },
        body: data
      });
    } catch (err: any) {
      setApiResponse({
        error: "Échec de la requête sandbox",
        message: err.message
      });
    } finally {
      setApiLoading(false);
    }
  };

  // Run Unit test suite
  const runUnitTests = async () => {
    setTestsLoading(true);
    try {
      const response = await fetch("/api/v1/tests/run", { method: "POST" });
      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      console.error("Error executing tests:", err);
    } finally {
      setTestsLoading(false);
    }
  };

  // Copy code to clipboard helper
  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filters calculation
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
    const matchesGroup = groupFilter === "all" ? true : r.classGroup === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  return (
    <div id="reporthub-root" className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Upper Navigation & Metadata Showcase */}
      <header id="main-header" className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Project Branding */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-lg flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6" id="brand-logo-icon" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight font-sans">ReportHub</h1>
                  <span className="bg-blue-900 text-blue-200 text-xs px-2 py-0.5 rounded-full font-mono">PHP-MVC-PDO Engine</span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">Plateforme d'éligibilité & de soutenance de rapports de stage de fin d'études</p>
              </div>
            </div>

            {/* Quick Context / Integration Indicator */}
            <div className="flex items-center space-x-3 bg-slate-800 border border-slate-705 px-4 py-2 rounded-xl text-xs max-w-sm">
              <Globe className="text-emerald-400 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">Interopérabilité LMS Active</p>
                <p className="text-slate-400 leading-3 mt-0.5">Interfacé OpenEduCat/Moodle via RESTful OpenAPI</p>
              </div>
            </div>

            {/* Active Simulation Role Box */}
            <div className="bg-slate-800 p-2 rounded-xl flex items-center space-x-2 border border-slate-700 self-start md:self-auto">
              <div className="flex items-center space-x-1.5 px-2">
                <UserCheck className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Rôle Simulé</span>
              </div>
              <select
                id="role-select"
                value={currentUser.id}
                onChange={(e) => switchUserRole(e.target.value)}
                className="bg-slate-950 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="u-1">🎓 Étudiant (Jane Doe - INF-2026)</option>
                <option value="u-3">👩‍🏫 Enseignant (Prof. Sarah Conner)</option>
                <option value="u-5">🛠️ Administrateur System (Full Bypass)</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav id="navbar-tabs" className="flex flex-wrap items-center gap-1.5 mt-5 border-t border-slate-800 pt-3">
            <button
              id="tab-workspace"
              onClick={() => setActiveTab("workspace")}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "workspace"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Tableau de Bord & Dépôts</span>
            </button>

            <button
              id="tab-architecture"
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "architecture"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Rapport d'Architecture & ERD</span>
            </button>

            <button
              id="tab-api"
              onClick={() => setActiveTab("api")}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all relative ${
                activeTab === "api"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Swagger API Sandbox</span>
              <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              id="tab-tests"
              onClick={() => setActiveTab("tests")}
              className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "tests"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Terminal className="h-4 w-4" />
              <span>Tests Unitaires (PHPUnit)</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content-section" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB WORKSPACE: Reports submissions, lists, grading, stats */}
        {activeTab === "workspace" && (
          <div id="workspace-view" className="space-y-6">
            
            {/* Quick stats grid */}
            <section id="stats-dashboard-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Soumissions Totales</p>
                  <p className="text-2xl font-bold font-mono text-slate-900">{stats.totalSubmissions}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rapports Notés</p>
                  <p className="text-2xl font-bold font-mono text-slate-900">{stats.gradedSubmissions}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">En attente d'avis</p>
                  <p className="text-2xl font-bold font-mono text-slate-900">{stats.pendingValidation}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Moyenne Académique</p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-2xl font-bold font-mono text-slate-900">{stats.averageGrade}</p>
                    <span className="text-xs font-semibold text-slate-400">/20</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Interactive Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Submissions / Action Panel Depending on role */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Active Role Indicator Card */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-850 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                    <UserIcon className="h-40 w-40" />
                  </div>
                  
                  <blockquote className="relative z-10">
                    <span className="inline-block bg-teal-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Session Active
                    </span>
                    <div className="flex items-center space-x-3 mt-3">
                      <img
                        src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                        alt="Profile avatar"
                        className="w-11 h-11 rounded-full object-cover border-2 border-teal-400 text-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-100 font-sans text-sm">{currentUser.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                        {currentUser.classGroup && (
                          <span className="inline-block text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-md mt-1 font-mono">
                            Promo: {currentUser.classGroup}
                          </span>
                        )}
                      </div>
                    </div>
                  </blockquote>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">Vos capacités simulées :</p>
                    {currentUser.role === "student" && (
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Formulaire de dépôt de rapport (.pdf)</li>
                        <li>Spécification des métadonnées d'entreprise</li>
                        <li>Consultation de vos notes & retours pédagogiques</li>
                      </ul>
                    )}
                    {currentUser.role === "teacher" && (
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Consultation des rapports de la promotion</li>
                        <li>Attribution d'une note sur 20</li>
                        <li>Saisie de commentaires d'évaluation</li>
                      </ul>
                    )}
                    {currentUser.role === "admin" && (
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Toutes les opérations de correction</li>
                        <li>Suppression des rapports conformes / non conformes</li>
                        <li>Bypass complet des régulateurs de champs</li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* STUDENT FORM: Submission upload */}
                {currentUser.role === "student" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <Send className="text-blue-600 h-5 w-5" />
                      <h3 className="font-bold text-slate-900 font-sans text-base">Soumettre un rapport</h3>
                    </div>

                    <form onSubmit={handleSubmission} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1" htmlFor="title-inp">
                          Titre du Rapport *
                        </label>
                        <input
                          id="title-inp"
                          type="text"
                          placeholder="ex: Développement d'une API en Laravel..."
                          value={submitTitle}
                          onChange={(e) => setSubmitTitle(e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1" htmlFor="company-inp">
                          Nom de l'Entreprise *
                        </label>
                        <input
                          id="company-inp"
                          type="text"
                          placeholder="ex: WebTech Solutions"
                          value={submitCompany}
                          onChange={(e) => setSubmitCompany(e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Sélectionner le Rapport PDF *
                        </label>
                        
                        {/* Custom visual file picker showing drag and drop compliance */}
                        <div className="mt-1 flex justify-center px-4 py-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer relative">
                          <div className="space-y-1 text-center">
                            <FileCode className="mx-auto h-8 w-8 text-slate-400" />
                            <div className="text-xs text-slate-600">
                              <span className="font-semibold text-blue-600 hover:underline">Uploader un fichier</span> ou glisser-déposer
                            </div>
                            <p className="text-[10px] text-slate-400">PDF uniquement pour interopérabilité (Moodle-compatible)</p>
                          </div>
                          <select 
                            id="file-select-sim"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => setSubmitFileName(e.target.value)}
                          >
                            <option value="">Sélectionner un fichier de démo...</option>
                            <option value="Rapport_Stage_Jane_Doe_INF22026.pdf">Rapport_Stage_Jane_Doe_INF2026.pdf (3.4 MB)</option>
                            <option value="Optimisation_Infrastructure_Smith.pdf">Optimisation_Infrastructure_Smith.pdf (4.1 MB)</option>
                            <option value="Rapport_Cybersecurite.docx">Rapport_Cybersecurite.docx (Interdit non-PDF pour test d'erreur)</option>
                          </select>
                        </div>
                        {submitFileName && (
                          <div className="mt-2 bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg flex items-center justify-between border border-blue-200">
                            <span className="truncate font-mono">{submitFileName}</span>
                            <button
                              id="clear-file"
                              type="button" 
                              onClick={() => setSubmitFileName("")} 
                              className="text-blue-900 font-bold hover:text-black ml-1 text-[11px]"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>

                      {formError && (
                        <div id="form-err-msg" className="bg-red-50 text-red-800 p-3 rounded-lg text-xs flex items-start space-x-2 border border-red-200 font-medium">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                          <span>{formError}</span>
                        </div>
                      )}

                      {formSuccess && (
                        <div id="form-success-msg" className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs flex items-start space-x-2 border border-emerald-200 font-medium animate-fadeIn">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{formSuccess}</span>
                        </div>
                      )}

                      <button
                        id="submit-report-btn"
                        type="submit"
                        disabled={isUploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1"
                      >
                        {isUploading ? "Traitement avec PDO..." : "Soumettre au framework PHP (INSERT)"}
                      </button>
                    </form>
                  </div>
                )}

                {/* TEACHER FORM: Select and Grade */}
                {(currentUser.role === "teacher" || currentUser.role === "admin") && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center space-x-2 mb-4">
                      <GraduationCap className="text-blue-600 h-5 w-5" />
                      <h3 className="font-bold text-slate-900 font-sans text-base">Notation & Avis</h3>
                    </div>

                    {selectedReportForGrading ? (
                      <form onSubmit={handleGrading} className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <p className="font-semibold text-slate-700 truncate">Sujet : {selectedReportForGrading.title}</p>
                          <p className="text-slate-500 mt-1">Étudiant : <span className="font-semibold text-slate-800">{selectedReportForGrading.studentName}</span></p>
                          <p className="text-slate-400 text-[10px] font-mono mt-0.5">Fichier : {selectedReportForGrading.fileName}</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1" htmlFor="grade-inp">
                            Note Académique (sur 20) *
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              id="grade-inp"
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={gradeValue}
                              onChange={(e) => setGradeValue(parseFloat(e.target.value))}
                              className="w-24 text-xs font-mono font-bold rounded-lg border border-slate-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              required
                            />
                            <span className="text-slate-500 text-xs font-semibold">/ 20</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">Système français obligatoire. Décimales admises (ex: 15.5)</span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1" htmlFor="feedback-inp">
                            Feedback & Rétroaction Pédagogique *
                          </label>
                          <textarea
                            id="feedback-inp"
                            rows={3}
                            placeholder="Saisissez des conseils pour l'amélioration, des commentaires sur le respect du plan ou du code..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          ></textarea>
                        </div>

                        {gradeError && (
                          <div className="bg-red-50 text-red-800 p-3 rounded-lg text-xs flex items-start space-x-2 border border-red-200">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                            <span>{gradeError}</span>
                          </div>
                        )}

                        {gradeSuccess && (
                          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs flex items-start space-x-2 border border-emerald-200 font-medium">
                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{gradeSuccess}</span>
                          </div>
                        )}

                        <div className="flex space-x-2 pt-1">
                          <button
                            id="submit-grade-btn"
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition"
                          >
                            Enregistrer Note (UPDATE)
                          </button>
                          <button
                            id="cancel-grading-btn"
                            type="button"
                            onClick={() => setSelectedReportForGrading(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg transition"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs">Cliquez sur <span className="font-semibold text-slate-600">"Noter / Evaluer"</span> dans la liste pour attribuer une note académique.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Integration Info Box */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <div className="flex items-center space-x-2 font-bold mb-1">
                    <Settings className="h-4 w-4 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <p>Contrôle de validation des données</p>
                  </div>
                  <p className="text-blue-800 leading-relaxed text-[11px]">
                    Grâce à la séparation d'architecture <strong>PHP MVC</strong>, toutes les saisies utilisateur sont sanitisées en amont dans les contrôleurs via <code>filter_input</code> et liées avec des paramètres préparés PDO pour bloquer toute injection SQL malicieuse.
                  </p>
                </div>

              </div>

              {/* Right Column: Submission list, filters, search */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Filters Row */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="search-inp"
                      type="text"
                      placeholder="Rechercher par titre, étudiant, entreprise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-200 font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filtres :</span>
                    </div>

                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="all">Tous statuts</option>
                      <option value="pending">⏳ En attente</option>
                      <option value="graded">✅ Noté (Graded)</option>
                    </select>

                    <select
                      id="promo-filter"
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="all">Toutes classes</option>
                      <option value="INF-2026">INF-2026</option>
                      <option value="SEN-2026">SEN-2026</option>
                    </select>
                  </div>
                </div>

                {/* Submissions List Container */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 font-sans text-sm flex items-center space-x-2">
                      <FileText className="text-slate-500 h-4 w-4" />
                      <span>Liste des rapports soumis</span>
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-sans ml-1">
                        {filteredReports.length} rapport{filteredReports.length > 1 ? "s" : ""}
                      </span>
                    </h3>
                    <button
                      id="reset-db-btn"
                      onClick={() => {
                        if (confirm("Réinitialiser les rapports fictifs en mémoire ?")) {
                          fetchData();
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Rafraîchir MySQL Data
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-xs font-mono">Lecture de l'état de la base de données...</p>
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Aucune soumission trouvée</p>
                      <p className="text-xs text-slate-500 mt-1">Essayez d'ajuster vos filtres de recherche ou changez votre promo.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100" id="submissions-list">
                      {filteredReports.map((report) => (
                        <div key={report.id} id={`report-item-${report.id}`} className="p-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            
                            <div className="space-y-1">
                              {/* Title, Status, and Class */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="bg-blue-100 text-blue-800 font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                                  {report.classGroup}
                                </span>
                                
                                {report.status === "graded" ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                                    <CheckCircle className="h-3 w-3 shrink-0" />
                                    <span>Évalué ({report.grade}/20)</span>
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>En attente</span>
                                  </span>
                                )}

                                <span className="text-slate-400 text-xs font-mono">ID: {report.id}</span>
                              </div>

                              <h4 className="font-bold text-slate-900 text-sm font-sans block leading-snug">
                                {report.title}
                              </h4>

                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>Étudiant : <strong className="text-slate-800 font-medium">{report.studentName}</strong></span>
                                <span className="text-slate-300">|</span>
                                <span>Entreprise : <strong className="text-slate-800 font-medium">{report.companyName}</strong></span>
                              </div>
                            </div>

                            {/* Actions Right Side */}
                            <div className="flex items-center space-x-2 shrink-0 md:self-center">
                              {/* Download simulated PDF */}
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(`Téléchargement simulé pour Moodle : ${report.fileName}\nStocké sous MVC storage/uploads/`);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition"
                                title="Télécharger le fichier PDF original"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Visualiser PDF</span>
                              </a>

                              {/* Grading action (for Teacher or Admin role) */}
                              {(currentUser.role === "teacher" || currentUser.role === "admin") && (
                                <button
                                  id={`grade-btn-${report.id}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedReportForGrading(report);
                                    setGradeValue(report.grade || 15);
                                    setFeedbackText(report.feedback || "");
                                    setGradeError("");
                                    setGradeSuccess("");
                                  }}
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
                                >
                                  Noter / Évaluer
                                </button>
                              )}

                              {/* Admin Delete Action */}
                              {(currentUser.role === "admin") && (
                                <button
                                  id={`delete-btn-${report.id}`}
                                  type="button"
                                  onClick={() => handleDeleteSubmission(report.id)}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                                  title="Supprimer la soumission définitivement"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                          </div>

                          {/* Sub-card showcasing Feedback if graded */}
                          {report.status === "graded" && (
                            <div className="mt-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                                  Avis et corrections académiques
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Noté par {report.gradedBy} le {new Date(report.gradedDate || "").toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 italic">
                                "{report.feedback}"
                              </p>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
            
          </div>
        )}

        {/* TAB ARCHITECTURE: MVC details, problem, comparative study, MySQL schema */}
        {activeTab === "architecture" && (
          <div id="architecture-view" className="space-y-8">
            
            {/* Conceptual Section */}
            <section id="academic-problem" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <BookOpen className="text-blue-600 h-5 w-5" />
                <span>1. Cadrage du Projet, Contexte & Objectifs</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 text-sm">Problématique & Enjeux</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {problemStatement.context}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {problemStatement.problem}
                  </p>

                  <h3 className="font-semibold text-slate-800 text-sm pt-2">Utilisateurs Cibles</h3>
                  <div className="space-y-2">
                    {problemStatement.targetUsers.map((user, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs">
                        <span className="font-bold text-slate-800 font-sans">{user.role}</span>
                        <p className="text-slate-600 mt-0.5">{user.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">
                    Objectifs Stratégiques de la Solution
                  </h3>
                  <ul className="space-y-3">
                    {problemStatement.objectives.map((obj, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs text-blue-800">
                        <span className="bg-blue-600 text-white rounded-full w-4.5 h-4.5 text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Benchmark Section */}
            <section id="benchmark-section" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Layers className="text-blue-600 h-5 w-5" />
                <span>2. Analyse Comparative (Benchmark)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <h3 className="font-bold text-slate-800 text-sm font-sans">{comp.name}</h3>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono">Solution Alternative</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 italic">"{comp.description}"</p>
                      
                      <div className="space-y-1 mt-3">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">Points forts :</p>
                        <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                          {comp.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>

                      <div className="space-y-1 mt-3">
                        <p className="text-[10px] font-bold text-red-700 uppercase">Limites fonctionnelles :</p>
                        <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                          {comp.limitations.map((l, i) => <li key={i}>{l}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/80 mt-4 text-xs text-blue-900">
                      <p className="font-bold">Améliorations ReportHub :</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-blue-800">{comp.improvementsByUs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Database & OOP design */}
            <section id="database-design-schema" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ERD Visualization Block */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                    <Database className="text-blue-600 h-5 w-5" />
                    <span>3. Modèle Conceptuel de Données (MCD / ERD)</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-3">
                    Le schéma relationnel garantit l'intégrité référentielle absolue. La suppression d'un compte étudiant (avec <code>ON DELETE CASCADE</code>) élimine automatiquement ses dépôts associés de la table MySQL reports.
                  </p>

                  {/* Schema graphical entities representation */}
                  <div className="mt-4 px-2 py-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <p className="font-bold text-xs text-blue-700 font-mono">Table: users (Soutient OOP)</p>
                      <div className="text-[11px] font-mono text-slate-500 mt-1 pl-2">
                        <div>🔑 id : INT <span className="text-amber-600">(PK)</span></div>
                        <div>▫️ name : VARCHAR(100)</div>
                        <div>▫️ email : VARCHAR(150) <span className="text-indigo-600">(UNIQUE)</span></div>
                        <div>▫️ password_hash : VARCHAR(255)</div>
                        <div>▫️ role : ENUM('student', 'teacher', 'admin')</div>
                        <div>▫️ class_group : VARCHAR(50)</div>
                      </div>
                    </div>

                    {/* Connection Line indicator */}
                    <div className="flex justify-center items-center h-4 text-slate-300 font-mono text-xs">
                      <span>↓ [1-N Relation: ON DELETE CASCADE] ↓</span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                      <p className="font-bold text-xs text-blue-700 font-mono">Table: reports (Contrôle CRUD)</p>
                      <div className="text-[11px] font-mono text-slate-500 mt-1 pl-2">
                        <div>🔑 id : INT <span className="text-amber-600">(PK)</span></div>
                        <div>🔗 student_id : INT <span className="text-teal-600">(FK users.id)</span></div>
                        <div>▫️ title : VARCHAR(255)</div>
                        <div>▫️ company_name : VARCHAR(150)</div>
                        <div>▫️ file_path : VARCHAR(255)</div>
                        <div>▫️ status : ENUM('pending', 'graded', 'rejected')</div>
                        <div>▫️ grade : DECIMAL(4,2)</div>
                        <div>▫️ feedback : TEXT</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Contraintes :</span> Le champ <code>grade</code> est gardé sous barème rigide par une instruction MySQL <code>CHECK (grade &gt;= 0.00 AND grade &lt;= 20.00)</code>.
                </div>
              </div>

              {/* Real MySQL SQL dump view */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 font-sans text-xs flex items-center space-x-1.5">
                    <FileCode className="text-slate-400 h-4 w-4" />
                    <span>Script MySQL de Déploiement standardisé</span>
                  </h3>
                  <button
                    id="copy-sql-btn"
                    onClick={() => copyCodeToClipboard(mysqlSchema)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedCode ? "Copié !" : "Copier SQL"}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[380px] flex-1">
                  <pre className="whitespace-pre">{mysqlSchema}</pre>
                </div>
              </div>

            </section>

            {/* Custom PHP MVC code explorer */}
            <section id="php-files-suite" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 font-sans flex items-center space-x-2">
                  <Layers className="text-blue-600 h-5 w-5" />
                  <span>4. Structure des Fichiers PHP & Programmation Orientée Objet (MVC)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explorez et copiez l'implémentation complète écrite selon la spécification PSR (PHP Standard Recommendations) avec des objets métiers typés décrivant nos contrôleurs et notre routeur unifié.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Left tab sidebar */}
                <div className="bg-slate-50/50 p-3 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Fichiers MVC</p>
                  {phpFilesList.map((file, idx) => (
                    <button
                      key={idx}
                      id={`php-file-tab-${idx}`}
                      onClick={() => setSelectedPhpFile(file)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition font-mono flex items-center justify-between ${
                        selectedPhpFile.path === file.path 
                          ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600" 
                          : "text-slate-650 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate">{file.path}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  ))}
                </div>

                {/* Main Code viewport */}
                <div className="lg:col-span-3 bg-slate-950 p-4 font-mono text-xs text-slate-300 relative flex flex-col min-h-[320px]">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                    <span className="bg-slate-800 text-slate-200 px-3 py-1 text-[11px] rounded font-semibold font-mono">
                      {selectedPhpFile.label}
                    </span>
                    <button
                      id="copy-php-btn"
                      onClick={() => copyCodeToClipboard(selectedPhpFile.code)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 text-[11px] px-2.5 py-1 rounded transition flex items-center space-x-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedCode ? "Copié !" : "Copier le code PHP"}</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre flex-1 text-slate-200">
                    {selectedPhpFile.code}
                  </pre>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB API REST: Interactive Swagger Specification playground */}
        {activeTab === "api" && (
          <div id="api-sandbox-view" className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Globe className="text-blue-600 h-5 w-5" />
                <span>Playground d'Interopérabilité REST & Spécification Swagger OpenAPI</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                L'un des prérequis clés est d'assurer l'interopérabilité totale de ReportHub avec d'autres LMS institutionnels comme <strong>OpenEduCat</strong> ou <strong>Moodle</strong>. Pour ce faire, ReportHub expose une API RESTful complète documentée selon le standard OpenAPI.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                
                {/* Visual spec checklist */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-xs font-bold text-teal-950 uppercase tracking-wide">Endpoints standardisés d'intégration :</p>
                    <div className="space-y-4 mt-3">
                      
                      <div className="flex items-start space-x-2 text-xs">
                        <span className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">POST</span>
                        <div>
                          <p className="font-bold text-slate-800">/auth/login</p>
                          <p className="text-slate-600 text-[11px]">Validation de session pour OpenEduCat Portal SSO</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-xs">
                        <span className="bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">GET</span>
                        <div>
                          <p className="font-bold text-slate-800">/reports</p>
                          <p className="text-slate-600 text-[11px]">Récupération des métadonnées compressées</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-xs">
                        <span className="bg-blue-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">POST</span>
                        <div>
                          <p className="font-bold text-slate-800">/reports</p>
                          <p className="text-slate-600 text-[11px]">Dépôt distant issu du dossier numérique de l'étudiant</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 text-xs">
                        <span className="bg-amber-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">POST</span>
                        <div>
                          <p className="font-bold text-slate-800">/reports/{`{id}`}/grade</p>
                          <p className="text-slate-600 text-[11px]">Liaison de notations pour transfert de moyennes scolaires</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* OpenEduCat connector simulate check */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs font-bold text-slate-800">Simuler la synchronisation avec Moodle :</p>
                    <p className="text-[11px] text-slate-600 mt-1">Vous pouvez tester vos endpoints sur la console ci-contre pour valider les codes de retour HTTP.</p>
                    <button
                      id="moodle-sync-test"
                      onClick={() => {
                        alert("Synchronisation des notes lancée : 100% des notes supérieures à 10/20 ont été intégrées dans le carnet de notes de la promotion Moodle !");
                      }}
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-white text-xs py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-1.5"
                    >
                      <Shuffle className="h-3.5 w-3.5 text-orange-400" />
                      <span>Déclencher Sync Moodle Gradebook</span>
                    </button>
                  </div>
                </div>

                {/* Tester workspace panel */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="bg-blue-900 text-blue-200 text-xs px-2.5 py-1 rounded font-bold font-mono uppercase tracking-wider">
                        Console API Sandbox v1
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Status: Sandbox Active</span>
                    </div>

                    {/* Endpoint select line */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select
                        id="api-method-select"
                        value={apiMethod}
                        onChange={(e) => {
                          const method = e.target.value as any;
                          setApiMethod(method);
                          if (method === "GET") {
                            setApiEndpoint("/api/v1/stats");
                          } else if (method === "POST") {
                            setApiEndpoint("/api/v1/reports");
                          } else if (method === "PUT") {
                            setApiEndpoint("/api/v1/reports/rep-101");
                          }
                        }}
                        className="bg-slate-950 text-xs font-mono font-bold rounded-lg border border-slate-700 p-2 text-slate-200 focus:outline-none"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT font-bold text-amber-500">PUT</option>
                      </select>

                      <input
                        id="api-endpoint-inp"
                        type="text"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="md:col-span-2 bg-slate-950 p-2 text-xs font-mono text-light rounded-lg border border-slate-700"
                        placeholder="/api/v1/health"
                      />

                      <button
                        id="api-send-req"
                        onClick={handleApiTest}
                        disabled={apiLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition"
                      >
                        {apiLoading ? "Envoi..." : "Envoyer Requête"}
                      </button>
                    </div>

                    {/* Body input if POST/PUT */}
                    {apiMethod !== "GET" && (
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Request Body / Payload (JSON) :</p>
                        <textarea
                          id="api-payload-box"
                          rows={4}
                          value={apiPayload}
                          onChange={(e) => setApiPayload(e.target.value)}
                          className="w-full bg-slate-950 p-3 rounded-lg font-mono text-[11px] border border-slate-700 focus:outline-none text-slate-300"
                        />
                      </div>
                    )}

                    {/* Response display */}
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">HTTP Server Response :</p>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] min-h-[160px] max-h-[240px] overflow-y-auto text-emerald-400">
                        {apiResponse ? (
                          <pre className="whitespace-pre-wrap">
                            {`HTTP/1.1 ${apiResponse.status} ${apiResponse.statusText || ""}\n`}
                            {`Content-Type: ${apiResponse.headers["Content-Type"]}\n\n`}
                            {JSON.stringify(apiResponse.body, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-slate-500 italic block">Envoyez une requête pour inspecter la réponse du serveur PHP/Express...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                    <span>Projet: ReportHub Integration Portal</span>
                    <span>Format: standard OpenAPI / Swagger Schema compliant</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB TESTS: Automated and PHPUnit Sandbox Console */}
        {activeTab === "tests" && (
          <div id="tests-sandbox-view" className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Terminal className="text-blue-600 h-5 w-5" />
                <span>Rapport de validation, Scénarios de tests & Console PHPUnit</span>
              </h2>
              <p className="text-xs text-slate-600 mt-2">
                Pour garantir la robustesse du code, des tests unitaires sont mockés et écrits dans le répertoire <code>/tests</code>. Cliquez sur le bouton d'exécution ci-dessous pour lancer l'interpréteur de tests et inspecter le passage des assertions PHPUnit.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                
                {/* Test Spec checklist */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Scénarios et Cas de Tests Validés :</p>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">TestFormValidationRefusesEmptyTitle</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">SUCCESS</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Rejette formellement toute soumission de formulaire avec un titre vide ou non-sanitisé.</p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">TestGradeBoundaryValidation</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">SUCCESS</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Vérifie que le système de notation de l'enseignant bloque et lève une exception hors de la plage autorisée [0-20].</p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">TestRouterUriParamParsing</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">SUCCESS</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Assure que l'analyse des paramètres regex (ex: <code>reports/&#123;id&#125;/grade</code>) est extraite de manière sécuritaire par le routeur custom.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-900 border border-blue-200">
                    <span className="font-bold">Limites Actuelles :</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-blue-850">
                      <li>Taille de fichier bloquée sur le serveur à 10 Mo pour soulager les disques d'uploads.</li>
                      <li>Le stockage par défaut en local exige la création d'un dossier <code>storage/uploads</code> accessible en écriture par le serveur Web (CHMOD 755).</li>
                    </ul>
                  </div>
                </div>

                {/* Simulated Terminal Console */}
                <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl border border-slate-900 p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-slate-900 rounded-lg text-emerald-400">
                          <Terminal className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200">Interpreter: PHPUnit 10.0.12 cli</span>
                      </div>
                      <button
                        id="run-tests-btn"
                        onClick={runUnitTests}
                        disabled={testsLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-lg font-semibold transition flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Play className="h-3.5 w-3.5 shrink-0" />
                        <span>{testsLoading ? "Exécution PHPUnit..." : "Exécuter la Suite de Tests"}</span>
                      </button>
                    </div>

                    <div className="font-mono text-emerald-400 text-xs min-h-[220px] max-h-[320px] overflow-y-auto bg-slate-950/80 p-4 border border-slate-900 rounded-xl">
                      {testResults ? (
                        <pre className="whitespace-pre-wrap">{testResults.rawOutput}</pre>
                      ) : (
                        <div className="text-center py-12 text-slate-500 italic">
                          <p>Aucun test n'a encore été lancé.</p>
                          <p className="text-[11px] mt-1">Appuyez sur "Exécuter la Suite de Tests" pour lancer PHPUnit.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850 text-[10px] text-slate-500 flex justify-between">
                    <span>Assertions: OK</span>
                    <span>Projet: ReportHub Standard Tests Suite</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Elegant academic footer */}
      <footer id="main-footer" className="bg-slate-900 text-white text-center py-6 mt-12 border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-300">ReportHub - Projet d'Éligibilité aux Stages</p>
          <p className="text-slate-500">Conçu selon les exigences du sujet avec une architecture de framework personnalisé MVC, l'interopérabilité OpenAPI, et les meilleures pratiques PSR.</p>
          <span className="inline-block bg-slate-850 text-[10px] font-mono px-3 py-1 rounded-md text-slate-400">
            © 2026 ReportHub Inc. - Tous droits réservés
          </span>
        </div>
      </footer>
    </div>
  );
}
