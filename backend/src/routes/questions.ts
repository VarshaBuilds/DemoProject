import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { search, tag, sortBy } = req.query;
    
    let query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (tag) {
      query.tags = tag as string;
    }
    
    let sort: any = { createdAt: -1 };
    
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'most-answers':
        sort = { answerCount: -1 };
        break;
      case 'unanswered':
        query.answerCount = 0;
        break;
    }
    
    const questions = await Question.find(query).sort(sort);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create question
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, tags } = req.body;
    
    const question = await Question.create({
      title,
      description,
      tags,
      authorId: req.user._id,
      author: req.user.username
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment views
router.patch('/:id/views', async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: 'Views incremented' });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get related questions
router.get('/:id/related', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const relatedQuestions = await Question.find({
      _id: { $ne: question._id },
      tags: { $in: question.tags }
    })
    .sort({ views: -1 })
    .limit(5);

    res.json(relatedQuestions);
  } catch (error) {
    console.error('Error fetching related questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;