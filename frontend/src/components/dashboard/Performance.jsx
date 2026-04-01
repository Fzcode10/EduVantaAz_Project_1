import React from 'react'

const Performance = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Performance
        </h2>
        <span className="text-sm text-[var(--text-secondary)]">
          Last 30 Days
        </span>
      </div>

      {/* Subject Wise Grade */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl p-4 space-y-3 shadow-sm">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          Subject-Wise Grade
        </h4>

        <div className="grid grid-cols-2 gap-4 text-sm text-[var(--text-primary)]">
          <div className="flex justify-between">
            <span>Math</span>
            <span className="font-semibold text-green-500">A</span>
          </div>
          <div className="flex justify-between">
            <span>Science</span>
            <span className="font-semibold text-blue-500">B+</span>
          </div>
          <div className="flex justify-between">
            <span>English</span>
            <span className="font-semibold text-yellow-500">B</span>
          </div>
          <div className="flex justify-between">
            <span>History</span>
            <span className="font-semibold text-green-500">A-</span>
          </div>
        </div>
      </div>

      {/* Test Score */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl p-4 space-y-2 shadow-sm">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          Test Score
        </h4>

        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-[var(--text-primary)]">
            86%
          </span>
          <span className="text-sm text-green-500 font-medium">
            +5% Improvement
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--border-divider)] rounded-full h-2 mt-2 break-after-auto overflow-hidden">
          <div className="bg-green-500 h-2 rounded-full w-[86%]"></div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-divider)] rounded-xl p-4 space-y-3 shadow-sm">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          Progress Overview
        </h4>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">24</p>
            <p className="text-[var(--text-secondary)]">Completed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">6</p>
            <p className="text-[var(--text-secondary)]">Pending</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">92%</p>
            <p className="text-[var(--text-secondary)]">Attendance</p>
          </div>
        </div>
      </div>

      {/* Extra Subtopic Section */}
      <div className="bg-accent/10 rounded-xl p-4 space-y-2 border border-accent/20">
        <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          Strength & Focus Area
        </h4>

        <div className="flex justify-between text-sm mt-2">
          <span className="text-green-500 font-medium">
            ✔ Strong: Algebra
          </span>
          <span className="text-red-500 font-medium">
            ⚠ Improve: Geometry
          </span>
        </div>
      </div>

    </div>
  );
}

export default Performance