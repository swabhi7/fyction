const mongoose = require('mongoose');

const feedbacksSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
});

const Feedbacks = module.exports = mongoose.model('Feedbacks', feedbacksSchema, 'Feedbacks');
