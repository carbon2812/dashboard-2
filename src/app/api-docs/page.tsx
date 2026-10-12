'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCode,
  ArrowLeft,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Server,
  Terminal,
  Layers,
} from 'lucide-react';
import { swaggerSpec } from '@/lib/swagger';

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically inject Swagger UI CSS & JS
    const cssId = 'swagger-ui-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css';
      document.head.appendChild(link);
    }

    const scriptId = 'swagger-ui-bundle';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initSwagger = () => {
      if ((window as any).SwaggerUIBundle) {
        (window as any).SwaggerUIBundle({
          spec: swaggerSpec,
          dom_id: '#swagger-ui-container',
          deepLinking: true,
          presets: [
            (window as any).SwaggerUIBundle.presets.apis,
            (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: 'BaseLayout',
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: 'list',
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
        });
        setLoading(false);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        initSwagger();
      };
      document.body.appendChild(script);
    } else if ((window as any).SwaggerUIBundle) {
      initSwagger();
    }
  }, []);

  const handleCopySpecUrl = () => {
    const url = `${window.location.origin}/api/docs`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(swaggerSpec, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'expense_tracker_openapi.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white">Expense Tracker API Docs</h1>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    OpenAPI 3.0.3
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Interactive REST API documentation & sandbox environment
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleCopySpecUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Copy link to raw JSON schema"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Spec URL'}</span>
            </button>

            <button
              onClick={handleDownloadSpec}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Download OpenAPI JSON schema file"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download JSON</span>
            </button>

            <Link
              href="/api/docs"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Info Bar */}
      <div className="bg-indigo-950/90 border-b border-indigo-900/60 text-indigo-200 px-6 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Server: <strong className="text-white font-mono">http://localhost:3000</strong></span>
            <span className="text-indigo-400">•</span>
            <span>Express Standalone: <strong className="text-white font-mono">http://localhost:5000</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auth: <span className="text-slate-300 font-medium">Session Cookie or Bearer JWT token</span></span>
          </div>
        </div>
      </div>

      {/* Swagger UI Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Initializing Swagger UI API sandbox...</p>
          </div>
        )}

        <div
          id="swagger-ui-container"
          className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-card"
        />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Expense Tracker — Corporate Spend & Disbursement Engine</p>
          <div className="flex items-center gap-4 text-indigo-600 font-medium">
            <Link href="/" className="hover:underline">Dashboard</Link>
            <Link href="/expenses" className="hover:underline">Expenses</Link>
            <Link href="/categories" className="hover:underline">Categories</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
