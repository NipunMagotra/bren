import React from 'react';
import { ExternalLink } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800/60">
        <h2 className="text-xl font-semibold text-white">
          About the Dataset
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Documentation of data collection pipelines, API sources, data normalization, and license details.
        </p>
      </div>

      {/* Origin Card */}
      <div className="p-6 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/profile.png" 
              alt="Researcher & Auditor Avatar" 
              className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
            />
            <div>
              <span className="text-xs text-zinc-500 font-medium">
                Source Repository
              </span>
              <h3 className="text-lg font-semibold text-white mt-0.5">
                TwitchDataset (by Luana Assis)
              </h3>
            </div>
          </div>
          <a
            href="https://github.com/luanaassis/TwitchDataset"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
          >
            GitHub Repository <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          The dataset was created and curated by <strong className="text-white">Luana Assis</strong> to investigate stream suitability, category popularity patterns, and tag influence on Twitch. The repository maintains 832 consecutive Excel snapshot datasets recorded between <strong className="text-white">October 13, 2024</strong> and <strong className="text-white">November 12, 2024</strong> (a full 31-day monitoring window).
        </p>
      </div>

      {/* Collector Architecture & Pipeline */}
      <div className="p-6 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <h3 className="text-base font-semibold text-white">
          Data Collection &amp; Sources
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-md bg-zinc-900/50 border border-zinc-800 space-y-1.5">
            <span className="text-zinc-200 font-semibold block text-sm">
              Python &amp; Selenium
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Automated headless scraper (<code className="text-zinc-300">collector.py</code>) that queries Twitch tag directory endpoints (e.g. <code className="text-zinc-300">#FamilyFriendly</code>, <code className="text-zinc-300">#SafeSpace</code>, <code className="text-zinc-300">#SFW</code>, <code className="text-zinc-300">#kids</code>) to discover live broadcast links.
            </p>
          </div>

          <div className="p-4 rounded-md bg-zinc-900/50 border border-zinc-800 space-y-1.5">
            <span className="text-zinc-200 font-semibold block text-sm">
              Twitch Helix API
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Official endpoints: <code className="text-zinc-300">/helix/channels</code> and <code className="text-zinc-300">/helix/streams</code> to collect channel metadata, live viewer counts, stream tags, mature flags (<code className="text-zinc-300">is_mature</code>), and content classification labels.
            </p>
          </div>

          <div className="p-4 rounded-md bg-zinc-900/50 border border-zinc-800 space-y-1.5">
            <span className="text-zinc-200 font-semibold block text-sm">
              IGDB API
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Queried via game IDs to obtain industry age ratings across international rating boards: ESRB (North America), PEGI (Europe), CERO (Japan), USK (Germany), and ACB (Australia).
            </p>
          </div>

          <div className="p-4 rounded-md bg-zinc-900/50 border border-zinc-800 space-y-1.5">
            <span className="text-zinc-200 font-semibold block text-sm">
              SHA-256 Privacy Anonymization
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              To adhere to ethical data-sharing practices and privacy standards, broadcaster logins and IDs were hashed via 256-bit cryptographic SHA-256 by the researcher before publication.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Data vs Derived Metrics Distinction */}
      <div className="p-6 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-4">
        <h3 className="text-base font-semibold text-white">
          Raw Data vs. Derived Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 font-medium">Data layer</th>
                <th className="py-2.5 font-medium">Fields</th>
                <th className="py-2.5 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              <tr>
                <td className="py-3 font-medium text-white">Raw dataset</td>
                <td className="py-3 text-zinc-300 leading-relaxed">
                  Snapshot timestamp, hashed channel ID, language, classification labels, stream title, game ID, IGDB ID, game name, age ratings list, is_mature boolean, stream tags, viewer count, source URL.
                </td>
                <td className="py-3 text-zinc-400">832 repository .xlsx files</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Calculated metrics</td>
                <td className="py-3 text-zinc-300 leading-relaxed">
                  Co-occurrence pairs matrix, tag frequency, diurnal 24-hour cycle aggregation, weekday vs weekend volume shifts, average/median audience figures, and compliance mismatch percentages.
                </td>
                <td className="py-3 text-zinc-400">Deterministic preprocessor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* License & Attribution */}
      <div className="p-6 rounded-lg bg-[#0c0e14] border border-zinc-800/80 space-y-3">
        <h3 className="text-base font-semibold text-white">
          License &amp; Attribution
        </h3>

        <p className="text-sm text-zinc-300 leading-relaxed">
          The dataset and this interactive analytics dashboard are published under the terms of the <strong className="text-white">GNU General Public License v3.0 (GPL-3.0)</strong>.
        </p>

        <div className="p-3.5 rounded-md bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
          <p className="mb-1 text-zinc-200 font-medium">GNU General Public License — Version 3, 29 June 2007</p>
          <p>
            This program is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose. See the GNU General Public License for details.
          </p>
        </div>
      </div>
    </div>
  );
};
