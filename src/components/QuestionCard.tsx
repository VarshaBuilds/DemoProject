import React from 'react';
import { MessageSquare, Clock, Tag, CheckCircle, Eye } from 'lucide-react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {question.title}
        </h3>
        {question.acceptedAnswerId && (
          <CheckCircle className="text-green-500 ml-2 flex-shrink-0" size={20} />
        )}
      </div>

      <div 
        className="text-gray-600 text-sm mb-4 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: question.description }}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{question.answerCount} answers</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{question.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatDate(question.createdAt)}</span>
          </div>
        </div>
        <span className="font-medium">by {question.author}</span>
      </div>
    </div>
  );
};