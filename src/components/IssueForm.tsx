import React, { useState } from 'react';
import { MapPin, Upload, CheckCircle2, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Issue } from '../types';

interface IssueFormProps {
  onSubmitIssue: (data: {
    title: string;
    description: string;
    location: string;
    contact_info?: string;
  }) => Promise<any>;
  onSelectIssue: (issue: Issue) => void;
}

export const IssueForm: React.FC<IssueFormProps> = ({ onSubmitIssue, onSelectIssue }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedResult, setLastCreatedResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setIsLoading(true);
    try {
      const res = await onSubmitIssue({
        title,
        description,
        location,
      });
      setLastCreatedResult(res);
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setSelectedPhoto(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file.name);
    }
  };

  const handlePrefill = (preset: { title: string; description: string; location: string }) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setLocation(preset.location);
    setLastCreatedResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Report an Issue</h1>
        <p className="text-sm text-slate-300">
          Tell us about the operational or maintenance issue in your area and we will route it to the right person.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* What happened? */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            What happened?
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Large pothole near Gate 1"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>

        {/* Tell us more */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Tell us more
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, urgency, or impact in detail..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
          />
        </div>

        {/* Where did it happen? */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Where did it happen?
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Gate Entrance, School Road"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
        </div>

        {/* Add a photo (optional) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Add a photo (optional)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              id="photo-upload"
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center justify-between w-full bg-slate-950 border border-slate-800 border-dashed hover:border-slate-700 rounded-2xl px-4 py-3 cursor-pointer transition-colors text-xs text-slate-400"
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>{selectedPhoto ? selectedPhoto : 'Upload or drag photo here...'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                Browse
              </span>
            </label>
          </div>
        </div>

        {/* Preset Helpers */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono">Sample ideas:</span>
          <button
            type="button"
            onClick={() => handlePrefill({
              title: 'Large pothole near school gate',
              description: 'There is a large pothole near the school gate and vehicles are having difficulty passing.',
              location: 'School Gate Entrance, Main Road'
            })}
            className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Pothole
          </button>
          <button
            type="button"
            onClick={() => handlePrefill({
              title: 'Street light not working',
              description: 'The street light near Block B has not been working for three days causing darkness at night.',
              location: 'Block B, Main Avenue'
            })}
            className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Street Light
          </button>
          <button
            type="button"
            onClick={() => handlePrefill({
              title: 'Overflowing garbage bin',
              description: 'Garbage bin near market complex has not been cleared for 4 days and is overflowing.',
              location: 'Central Market Complex'
            })}
            className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Garbage
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !title || !description || !location}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold text-sm tracking-wide uppercase shadow-xl shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Submitting Issue...</span>
              </>
            ) : (
              <>
                <span>Submit Issue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Decision Summary Banner (If submitted) */}
      {lastCreatedResult && (
        <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Your issue has been assigned</h3>
            </div>
            <button
              onClick={() => onSelectIssue(lastCreatedResult.issue)}
              className="text-xs font-bold text-teal-400 hover:underline flex items-center space-x-1"
            >
              <span>Track Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Issue</span>
              <span className="font-bold text-white truncate block">{lastCreatedResult.issue.title}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Priority</span>
              <span className="font-bold text-amber-400 font-mono">{lastCreatedResult.issue.priority}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Department</span>
              <span className="font-bold text-slate-200">{lastCreatedResult.issue.department_name}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-slate-500 block mb-1 font-mono uppercase text-[10px]">Assigned to</span>
              <span className="font-bold text-emerald-400">
                {lastCreatedResult.issue.assigned_employee_name || 'UNASSIGNED'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
