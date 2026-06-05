import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedCard({ children, className }: AnimatedCardProps) {
  return (
    <div
      className={`bg-white dark:bg-green-900 bg-opacity-30 dark:bg-opacity-30 backdrop-blur-md rounded-xl shadow-lg p-4 transition-transform hover:scale-105 ${className}`}
    >
      {children}
    </div>
  );
}
