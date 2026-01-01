import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

export const CardHeader = ({ title, icon, right }) => (
  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {right}
  </div>
);

export const CardBody = ({ children }) => <div className="p-6">{children}</div>;