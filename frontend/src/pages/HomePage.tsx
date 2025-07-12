import React, { useState, useMemo } from 'react';
import { Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { QuestionCard } from '../components/QuestionCard';
import { useQuestions } from '../hooks/useQuestions';
import { Question } from '../types';

interface HomePageProps {
  onQuestionClick: (question: Question) => void;
  searchQuery: string;
}

type SortOption = 'newest' | 'oldest' | 'most-answers' | 'unanswered';

export const HomePage: React.FC<HomePageProps> = ({ onQuestionClick, searchQuery }) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  const { questions } = useQuestions();

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(q => q.tags.includes(selectedTag));
    }

    // Sort questions
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-answers':
          return b.answerCount - a.answerCount;
        case 'unanswered':
          if (a.answerCount === 0 && b.answerCount === 0) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (a.answerCount === 0) return -1;
          if (b.answerCount === 0) return 1;
          return 0;
        default:
          return 0;
      }
    });

    return sorted;
  }, [questions, searchQuery, selectedTag, sortBy]);

  // Get all unique tags from questions
  const allTags = useMemo(() => {
    const tagCounts = questions.reduce((acc, question) => {
      question.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20) // Show top 20 tags
      .map(([tag, count]) => ({ tag, count }));
  }, [questions]);

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case 'newest':
      case 'oldest':
        return <Clock size={16} />;
      case 'most-answers':
        return <TrendingUp size={16} />;
      case 'unanswered':
        return <CheckCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedQuestions.length} question{filteredAndSortedQuestions.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedTag && ` tagged with "${selectedTag}"`}
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-answers">Most Answers</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Tags</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  !selectedTag 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Questions
              </button>
              {allTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedTag === tag 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tag}</span>
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3">
          {filteredAndSortedQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <CheckCircle size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedTag 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Be the first to ask a question!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onClick={() => onQuestionClick(question)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};