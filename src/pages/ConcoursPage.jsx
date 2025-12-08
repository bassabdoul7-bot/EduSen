import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { usePlan } from '../hooks/usePlan';

const LEVEL_COLORS = {
  cm2: 'bg-green-100 text-green-800',
  bfem: 'bg-blue-100 text-blue-800',
  bac: 'bg-purple-100 text-purple-800',
  licence: 'bg-orange-100 text-orange-800'
};

const LEVEL_LABELS = {
  cm2: 'CM2',
  bfem: 'BFEM',
  bac: 'BAC',
  licence: 'Licence'
};

export default function ConcoursPage() {
  const { canAccessExamPrep } = usePlan();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState([]);
  const [activeTab, setActiveTab] = useState('papers');
  const [generating, setGenerating] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    loadSchools();
    loadPapers();
  }, []);

  async function loadSchools() {
    const { data } = await supabase
      .from('concours_schools')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setSchools(data || []);
    setLoading(false);
  }

  async function loadPapers() {
    const { data } = await supabase
      .from('concours_papers')
      .select('*')
      .order('year', { ascending: false });
    setPapers(data || []);
  }

  function getSchoolPapers(schoolCode) {
    return papers.filter(p => p.school_code === schoolCode);
  }

  function groupPapersByYear(schoolPapers) {
    const grouped = {};
    schoolPapers.forEach(paper => {
      if (!grouped[paper.year]) {
        grouped[paper.year] = { epreuve: null, corrige: null };
      }
      grouped[paper.year][paper.paper_type] = paper;
    });
    return grouped;
  }

  async function generatePrediction() {
    if (!selectedSchool) return;
    setGenerating(true);
    setPrediction(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Tu es un expert en concours senegalais avec 20 ans d'experience. Analyse les tendances des concours ${selectedSchool.code} (${selectedSchool.name}) des dernieres annees et genere une PREDICTION des sujets probables pour la session 2026.

Niveau requis: ${LEVEL_LABELS[selectedSchool.level] || selectedSchool.level}
Matieres: ${selectedSchool.subjects?.join(', ') || 'Toutes matieres'}

Base ton analyse sur:
- Les themes recurrents des 5 dernieres annees
- Les sujets d'actualite au Senegal et en Afrique
- Les reformes educatives recentes
- Les tendances pedagogiques

IMPORTANT: Reponds UNIQUEMENT en JSON valide:
{
  "annee": "2026",
  "analyse": "Resume de ton analyse des tendances",
  "themes_probables": [
    {
      "matiere": "Nom de la matiere",
      "themes": ["Theme 1", "Theme 2", "Theme 3"],
      "justification": "Pourquoi ces themes sont probables"
    }
  ],
  "questions_predites": [
    {
      "matiere": "Nom de la matiere",
      "question": "Question probable detaillee",
      "type": "QCM ou Redaction ou Probleme",
      "difficulte": "Facile ou Moyen ou Difficile",
      "conseil": "Conseil pour bien repondre"
    }
  ],
  "conseils_revision": ["Conseil 1", "Conseil 2", "Conseil 3"]
}`
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text;
      const parsed = JSON.parse(text);
      setPrediction(parsed);
    } catch (error) {
      console.error('Error generating prediction:', error);
      alert('Erreur lors de la generation. Verifiez votre cle API.');
    }
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const schoolPapers = selectedSchool ? getSchoolPapers(selectedSchool.code) : [];
  const papersByYear = groupPapersByYear(schoolPapers);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Concours du Senegal</h1>
          <p className="text-green-100">Anciennes epreuves et predictions IA pour 2026</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ecoles et Concours</h2>
            <div className="space-y-2">
              {schools.map(school => (
                <button key={school.code} onClick={() => { setSelectedSchool(school); setActiveTab('papers'); setPrediction(null); }} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedSchool?.code === school.code ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{school.code}</h3>
                      <p className="text-sm text-gray-600">{school.name}</p>
                      {getSchoolPapers(school.code).length > 0 && (
                        <span className="inline-flex items-center mt-1 text-xs text-green-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                          {getSchoolPapers(school.code).length} PDF disponibles
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${LEVEL_COLORS[school.level] || 'bg-gray-100'}`}>{LEVEL_LABELS[school.level] || school.level}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedSchool ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedSchool.name}</h2>
                <p className="text-gray-600 mb-4">{selectedSchool.description}</p>

                <div className="flex border-b mb-6">
                  <button onClick={() => setActiveTab('papers')} className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'papers' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    Anciennes Epreuves
                    {schoolPapers.length > 0 && <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{schoolPapers.length}</span>}
                  </button>
                  <button onClick={() => setActiveTab('prediction')} className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'prediction' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Prediction IA 2026
                  </button>
                </div>

                {activeTab === 'papers' && (
                  <div>
                    {Object.keys(papersByYear).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(papersByYear).sort(([a], [b]) => parseInt(b) - parseInt(a)).map(([year, docs]) => (
                          <div key={year} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">{year}</span>
                              Session {year}
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {docs.epreuve && (
                                <a href={docs.epreuve.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group">
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 group-hover:text-green-700">Epreuve {year}</p>
                                    <p className="text-xs text-gray-500">{docs.epreuve.duration_minutes ? `${docs.epreuve.duration_minutes} min - ` : ''}PDF</p>
                                  </div>
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </a>
                              )}
                              {docs.corrige && (
                                <a href={docs.corrige.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors group">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 group-hover:text-green-700">Corrige {year}</p>
                                    <p className="text-xs text-gray-500">Avec explications - PDF</p>
                                  </div>
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </a>
                              )}
                            </div>
                            {docs.epreuve?.description && <p className="text-sm text-gray-500 mt-2">{docs.epreuve.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-gray-600">Pas encore d'epreuves disponibles pour {selectedSchool.code}</p>
                        <p className="text-sm text-gray-400 mt-1">Les anciennes epreuves seront bientot ajoutees</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'prediction' && (
                  <div>
                    {!prediction && !generating && (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Prediction IA pour {selectedSchool.code} 2026</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">Notre IA analyse les tendances des annees precedentes pour predire les sujets probables du concours 2026</p>
                        {!canAccessExamPrep ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-yellow-800 mb-3">Passez a Premium pour acceder aux predictions IA</p>
                            <Link to="/pricing" className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg">Voir les offres</Link>
                          </div>
                        ) : (
                          <button onClick={generatePrediction} className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 shadow-lg">
                            Generer les Predictions 2026
                          </button>
                        )}
                      </div>
                    )}

                    {generating && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Analyse des tendances en cours...</p>
                        <p className="text-sm text-gray-400 mt-1">Notre IA examine les epreuves des annees precedentes</p>
                      </div>
                    )}

                    {prediction && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Session 2026</span>
                            <span className="text-green-800 font-semibold">{selectedSchool.code}</span>
                          </div>
                          <p className="text-green-800">{prediction.analyse}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            Themes Probables par Matiere
                          </h3>
                          <div className="grid gap-3">
                            {prediction.themes_probables?.map((item, idx) => (
                              <div key={idx} className="bg-white border rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">{item.matiere}</h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {item.themes?.map((theme, i) => (
                                    <span key={i} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">{theme}</span>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-500">{item.justification}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Questions Predites
                          </h3>
                          <div className="space-y-3">
                            {prediction.questions_predites?.map((q, idx) => (
                              <div key={idx} className="bg-white border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{q.matiere}</span>
                                  <span className={`text-xs px-2 py-1 rounded ${q.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : q.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{q.difficulte}</span>
                                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{q.type}</span>
                                </div>
                                <p className="text-gray-900 mb-2">{q.question}</p>
                                <p className="text-sm text-green-600 flex items-start gap-1">
                                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {q.conseil}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            Conseils de Revision
                          </h3>
                          <ul className="space-y-2">
                            {prediction.conseils_revision?.map((conseil, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-blue-800">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {conseil}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button onClick={generatePrediction} className="w-full py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50">
                          Regenerer les Predictions
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Selectionnez une ecole</h3>
                <p className="text-gray-600">Choisissez un concours pour voir les anciennes epreuves ou generer des predictions IA</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
