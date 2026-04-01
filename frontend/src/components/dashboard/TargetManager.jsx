import React from 'react'

export default function TargetManagement() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          Target Management
        </h3>
        <button className="text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-hover-light)] dark:hover:bg-accent-hover transition cursor-pointer font-medium shadow-sm active:scale-95">
          + Add Goal
        </button>
      </div>

      {/* Goal Setting */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl p-4 space-y-3 shadow-sm">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Goal Setting
        </h2>

        <div className="space-y-3 text-sm text-[var(--text-primary)] mb-1">
          <div className="flex justify-between">
            <span>Complete 5 Mock Tests</span>
            <span className="text-green-500 font-medium">In Progress</span>
          </div>

          <div className="flex justify-between">
            <span>Improve Math by 10%</span>
            <span className="text-yellow-500 font-medium">Ongoing</span>
          </div>

          <div className="flex justify-between">
            <span>Finish Science Syllabus</span>
            <span className="text-red-500 font-medium">Not Started</span>
          </div>
        </div>
      </div>

      {/* Target Status Tracking */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl p-4 space-y-4 shadow-sm">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Target Status Tracking
        </h2>

        {/* Progress Item */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-primary)] font-medium">Mock Tests</span>
            <span className="font-medium text-[var(--text-secondary)]">60%</span>
          </div>
          <div className="w-full bg-[var(--border-divider)] rounded-full h-2 overflow-hidden">
            <div className="bg-accent h-2 rounded-full w-[60%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1 mt-3">
            <span className="text-[var(--text-primary)] font-medium">Math Improvement</span>
            <span className="font-medium text-[var(--text-secondary)]">40%</span>
          </div>
          <div className="w-full bg-[var(--border-divider)] rounded-full h-2 overflow-hidden">
            <div className="bg-green-500 h-2 rounded-full w-[40%]"></div>
          </div>
        </div>
      </div>

      {/* Mentor Oversight */}
      <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 space-y-3 shadow-sm">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          Mentor Oversight
        </h2>

        <div className="text-sm text-[var(--text-secondary)]">
          <p className="flex items-center gap-1.5 font-medium mb-1">
            📌 Mentor Suggestion:
          </p>
          <p className="mt-1 text-[var(--text-primary)]">
            Focus more on Geometry practice tests this week to reach your improvement target.
          </p>
        </div>

        <div className="flex justify-between text-xs text-[var(--text-secondary)] opacity-80 pt-2 border-t border-[var(--border-divider)]">
          <span>Last Review: 2 days ago</span>
          <span>Next Review: Friday</span>
        </div>
      </div>

      {/* Extra Subtopic */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          Weekly Focus Plan
        </h2>

        <ul className="text-sm text-[var(--text-primary)] space-y-1.5 list-disc list-inside mt-2">
          <li>Revise Algebra formulas</li>
          <li>Attempt 2 full-length tests</li>
          <li>Analyze weak areas after mock test</li>
        </ul>
      </div>

    </div>
  );
}
