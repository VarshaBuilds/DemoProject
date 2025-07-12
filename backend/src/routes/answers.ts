import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create answer
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { questionId, content } = req.body;
    
    const answer = await Answer.create({
      questionId,
      content,
      authorId: req.user._id,
      author: req.user.username
    });
    
    // Update question answer count
    await Question.findByIdAndUpdate(questionId, { 
      $inc: { answerCount: 1 } 
    });
    
    // Update user answer count
    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { answerCount: 1 } 
    });
    
    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept answer
router.patch('/:id/accept', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the question owner
    if (question.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question owner can accept answers' });
    }

    // Unaccept previous answer if any
    await Answer.updateMany({ questionId: answer.questionId }, { isAccepted: false });
    
    // Accept this answer
    answer.isAccepted = true;
    await answer.save();
    
    // Update question
    question.acceptedAnswerId = answer._id;
    await question.save();
    
    res.json({ message: 'Answer accepted' });
  } catch (error) {
    console.error('Error accepting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;