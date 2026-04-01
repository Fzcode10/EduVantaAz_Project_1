import React from 'react';

export const ProfileItem = ({ label, value }) => (
  <div className="group p-4 rounded-2xl border border-[var(--border-divider)] bg-[var(--bg-primary)] hover:border-accent/40 hover:bg-[var(--bg-surface)] shadow-inner transition-all duration-300">
    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">
      {label}
    </p>
    <p className="text-[var(--text-primary)] font-semibold wrap-break-word">
      {value ? (
        value
      ) : (
        <span className="text-[var(--text-secondary)] italic font-normal text-sm opacity-60">Not Provided</span>
      )}
    </p>
  </div>
);