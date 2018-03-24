let mongoose = require('mongoose');

let FanFictionsScheme = mongoose.Schema({
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
  email: {
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

let FanFictions = module.exports = mongoose.model('FanFictions', FanFictionsScheme, 'FanFictions');
