import React from 'react';
import { motion } from 'framer-motion';
import type { Category } from '../../types';

interface FoundGroupsProps {
  groups: Category[];
}

const difficultyColors = {
  easy: 'bg-difficulty-easy text-black',
  medium: 'bg-difficulty-medium text-black',
  tricky: 'bg-difficulty-tricky text-white',
  hard: 'bg-difficulty-hard text-white',
};

export const FoundGroups: React.FC<FoundGroupsProps> = ({ groups }) => {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2 max-w-2xl mx-auto mb-6" role="region" aria-label="Found categories">
      {groups.map((group, index) => (
        <motion.div
          key={group.name}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`rounded-lg p-4 ${difficultyColors[group.difficulty]}`}
        >
          <h3 className="font-bold text-sm md:text-base mb-1">{group.name}</h3>
          <p className="text-xs md:text-sm opacity-90">{group.words.join(', ')}</p>
        </motion.div>
      ))}
    </div>
  );
};
