let mongoose = require('mongoose');

let FanTheoriesScheme = mongoose.Schema({
  title: {
    required: true,
    type: String
  },
  body: {
    required: true,
    type: String
  },
  author: {
    required: false,
    type: String
  },
  noOfLikes: {
    required: false,
    type: Number
  },
  date: {
    required: false,
    type: String
  },
  time: {
    required: false,
    type: String
  },
  comments: {
    required: false,
    type: Array
  },
  category: {
    required: false,
    type: String
  },
  dateandtime: {
    required: false,
    type: Date
  },
  likedBy: {
    required: false,
    type: Array
  }
});

let FanTheories = module.exports = mongoose.model('FanTheories', FanTheoriesScheme, 'FanTheories');
