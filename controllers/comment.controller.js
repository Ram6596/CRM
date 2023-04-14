/**
 * This is the controller for the comment resource
 */
const Comment = require("../models/comment.model");
const User = require("../models/user.model");
const Ticket = require("../models/ticket.model");
const constants = require("../utils/constants");
const objectConvertor = require("../utils/objectConverter");

/**
 * Create a Comment for a ticket
 *
 */
exports.createComment = async (req, res) => {
  const commentObject = {
    content: req.body.content,
    ticketId: req.params.ticketId,
    commenterId: req.userId,
  };

  try {
    const comment = await Comment.create(commentObject);

    res.status(201).send(comment);
  } catch (err) {
    console.log("Some error happened while creating comment", err.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};

/**
 * Get the comments for the given ticket
 *
 */
exports.fetchComments = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.ticketId,
    });

    const savedUser = await User.findOne({
      userId: req.userId,
    });

    if (
      savedUser.userType !== constants.userTypes.admin &&
      ticket.assignee !== req.userId &&
      ticket.reporter !== req.userId
    ) {
      res.status(200).send([]);
      return;
    }
    const comment = await Comment.find({ ticketId: req.params.ticketId });
    res.status(200).send(comment);
  } catch (err) {
    console.log("Some error happened while fetching comment", err.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};
