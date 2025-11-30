'use client';

interface TopicTagsProps {
  onTagClick: (topic: string) => void;
}

export default function TopicTags({ onTagClick }: TopicTagsProps) {
  const availableTopics = [
    'Algebra'  ];

  const comingSoonTopics = [
    'Calculus',
    'Physics',
    'Chemistry',
    'Programming'
  ];

  return (
    <div className="flex flex-col items-center gap-4 max-w-3xl">
      {/* Available Topics */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-3">
          {availableTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => onTagClick(topic)}
              className="topic-tag"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon Topics */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Coming Soon</p>
        <div className="flex flex-wrap justify-center gap-3">
          {comingSoonTopics.map((topic, index) => (
            <div
              key={index}
              className="topic-tag opacity-50 cursor-not-allowed"
              title="Coming soon!"
            >
              {topic}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}