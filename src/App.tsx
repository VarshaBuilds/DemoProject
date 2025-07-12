import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { QuestionForm } from './pages/QuestionForm';
import { QuestionDetail } from './pages/QuestionDetail';
import { useAuth } from './hooks/useAuth';
import { Question } from './types';

type CurrentPage = 'home' | 'ask' | 'question';

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, loading } = useAuth();

  const handleAskQuestion = () => {
    if (user) {
      setCurrentPage('ask');
    }
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setCurrentPage('question');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedQuestion(null);
  };

  const handleQuestionCreated = () => {
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAskQuestion={handleAskQuestion}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {currentPage === 'home' && (
          <HomePage
            onQuestionClick={handleQuestionClick}
            searchQuery={searchQuery}
          />
        )}
        
        {currentPage === 'ask' && (
          <QuestionForm
            onBack={handleBackToHome}
            onSuccess={handleQuestionCreated}
          />
        )}
        
        {currentPage === 'question' && selectedQuestion && (
          <QuestionDetail
            question={selectedQuestion}
            onBack={handleBackToHome}
          />
        )}
      </main>
    </div>
  );
}

export default App;