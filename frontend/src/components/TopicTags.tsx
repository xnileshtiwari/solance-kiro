'use client';

interface TopicTagsProps {
  onTagClick: (topic: string) => void;
}

export default function TopicTags({ onTagClick }: TopicTagsProps) {
  const suggestedTopics = [
    'Linear Equations',
    'Quadratic Functions', 
    'Polynomial Algebra',
    'Systems of Equations',
    'Algebraic Expressions',
    'Factoring'
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
      {suggestedTopics.map((topic, index) => (
        <button
          key={index}
          onClick={() => onTagClick(topic)}
          className="topic-tag"
        >
          {topic}
        </button>
      ))}
    </div>
  );
}