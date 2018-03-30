let mongoose = require('mongoose');

let FanArtsScheme = mongoose.Schema({
  caption: {
    required: false,
    type: String
  },
  filename: {
    required: false,
    type: String
  },
  createdBy: {
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

let FanArts = module.exports = mongoose.model('FanArts', FanArtsScheme, 'FanArts');
