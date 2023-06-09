const User = require("../models/user.model");
const Ticket = require("../models/ticket.model");
const constants = require("../utils/constants");
const objectConverter = require("../utils/objectConverter");

exports.createTicket = async (req, res) => {
  const ticketObject = {
    title: req.body.title,
    ticketPriority: req.body.ticketPriority,
    description: req.body.description,
    status: req.body.status,
    reporter: req.userId, //this will be retrieved from the middleware
  };

  /**
   * Logic to find an Engineer in the Approved state
   */
  const engineer = await User.findOne({
    userType: constants.userTypes.engineer,
    userStatus: constants.userStatus.approved,
  });
  ticketObject.assignee = engineer.userId;

  try {
    const ticket = await Ticket.create(ticketObject);

    if (ticket) {
      //Updating the customer
      const user = await User.findOne({
        userId: req.userId,
      });
      user.ticketsCreated.push(ticket._id);
      await user.save();

      //Updating the Engineer
      engineer.ticketsAssigned.push(ticket._id);
      await engineer.save();

      res.status(201).send(objectConverter.ticketResponse(ticket));
    }
  } catch (err) {
    console.log("Some error happened while creating ticket", err.message);
    res.status(500).send({
      message: "Some internal server error",
    });
  }
};

/**
 * Update the ticket
 *
 * Only the user who has created the ticket should be allowed to update the ticket
 */
exports.updateTicket = async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id });

  const savedUser = await User.findOne({
    userId: req.userId,
  });

  if (
    ticket.reporter == req.userId ||
    ticket.assignee == req.userId ||
    savedUser.userType == constants.userTypes.admin
  ) {
    //Allowed to update
    ticket.title = req.body.title ?? ticket.title;
    ticket.description = req.body.description ?? ticket.description;
    ticket.ticketPriority = req.body.ticketPriority ?? ticket.ticketPriority;
    ticket.status = req.body.status ?? ticket.status;
    ticket.assignee = req.body.assignee ?? ticket.assignee;

    const updatedTicket = await ticket.save();
    res.status(200).send(objectConverter.ticketResponse(updatedTicket));
  } else {
    console.log(
      "Ticket was being updated by someone who has not created the ticket"
    );
    res.status(401).send({
      message: "Ticket can be updated only by the customer who created it",
    });
  }
};

/**
 * Get the list of all the tickets created by me
 */
exports.getAllTickets = async (req, res) => {
  /**
   * First find the type of user
   * 1. ADMIN should get the list of all the tickets in the descending order of creation date
   * 2. Customer should be able to see only the tickets created by him/her
   * 3. Engineer should be able to see all the tickets assigned to him or created by him
   *
   */
  const queryObj = {};

  if (req.query.status != undefined) {
    queryObj.status = req.query.status;
  }
  const savedUser = await User.findOne({
    userId: req.userId,
  });

  if (savedUser.userType == constants.userTypes.admin) {
    //Do nothing
  } else if (savedUser.userType == constants.userTypes.engineer) {
    queryObj.assignee = req.userId;
  } else {
    queryObj.reporter = req.userId;
  }

  const tickets = await Ticket.find(queryObj);
  res.status(200).send(objectConverter.ticketListResponse(tickets));
};

/**
 * Get the ticket based on the ticketId
 */

exports.getOneTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
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
    res.status(200).send(objectConverter.ticketResponse(ticket));
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
