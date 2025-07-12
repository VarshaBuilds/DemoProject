import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { TagInput } from '../components/TagInput';
import { useQuestions } from '../hooks/useQuestions';
import { useAuth } from '../hooks/useAuth';

interface QuestionFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ onBack, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createQuestion } = useQuestions();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !description.trim() || tags.length === 0) {
      setError('Please fill in all fields and add at least one tag.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      createQuestion({
        title: title.trim(),
        description: description.trim(),
        tags,
        authorId: user.id,
        author: user.username,
      });

      onSuccess();
    } catch (err) {
      setError('Failed to create question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Ask a Question</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Be specific and imagine you're asking a question to another person"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/150 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Include all the information someone would need to answer your question"
              className="min-h-[200px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add up to 5 tags to describe what your question is about"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add tags that describe your question (e.g., javascript, react, css)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || tags.length === 0}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};