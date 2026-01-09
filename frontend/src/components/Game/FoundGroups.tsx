import { motion } from 'framer-motion';
import type { Category } from '../../types';

interface FoundGroupsProps {
  groups: Category[];
}

const colorStyles = {
  yellow: { backgroundColor: '#f9ca24', color: '#000000' },
  green: { backgroundColor: '#6dd5a0', color: '#000000' },
  blue: { backgroundColor: '#4a90e2', color: '#000000' },
  purple: { backgroundColor: '#a29bfe', color: '#000000' },
} as const;

const difficultyStyles = {
  easy: { backgroundColor: '#f9ca24', color: '#000000' },
  medium: { backgroundColor: '#6dd5a0', color: '#000000' },
  tricky: { backgroundColor: '#4a90e2', color: '#000000' },
  hard: { backgroundColor: '#a29bfe', color: '#000000' },
} as const;

function getGroupStyle(group: Category) {
  if (group.color && group.color in colorStyles) {
    return colorStyles[group.color as keyof typeof colorStyles];
  }
  if (group.difficulty && group.difficulty in difficultyStyles) {
    return difficultyStyles[group.difficulty as keyof typeof difficultyStyles];
  }
  return { backgroundColor: '#e5e7eb', color: '#000000' }; // fallback gray
}

export const FoundGroups = ({ groups }: FoundGroupsProps) => {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2 max-w-2xl mx-auto mb-3" role="region" aria-label="Found categories">
      {groups.map((group, index) => (
        <motion.div
          key={group.name}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="rounded-lg p-4 text-center"
          style={getGroupStyle(group)}
        >
          <h3 className="font-bold text-base md:text-lg mb-2 uppercase tracking-wide">{group.name}</h3>
          <p className="text-sm md:text-base font-medium uppercase">{group.words.join(', ')}</p>
        </motion.div>
      ))}
    </div>
  );
};
