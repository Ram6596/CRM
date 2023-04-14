const ticketController = require("../controllers/ticket.controller");
const commentController = require("../controllers/comment.controller");
const {
  authJwt,
  verifyTicketRequestBody,
  verifyCommentRequestBody,
} = require("../middlewares");

module.exports = function (app) {
  app.post(
    "/crm/api/v1/tickets/",
    [authJwt.verifyToken, verifyTicketRequestBody.validateTicketRequestBody],
    ticketController.createTicket
  );
  app.put(
    "/crm/api/v1/tickets/:id",
    [authJwt.verifyToken, verifyTicketRequestBody.validateTicketStatus],
    ticketController.updateTicket
  );
  app.get(
    "/crm/api/v1/tickets",
    [authJwt.verifyToken],
    ticketController.getAllTickets
  );
  app.get(
    "/crm/api/v1/tickets/:id",
    [authJwt.verifyToken],
    ticketController.getOneTicket
  );
  app.post(
    "/crm/api/v1/tickets/:ticketId/comments",
    [authJwt.verifyToken, verifyCommentRequestBody.validateCommentRequestBody],
    commentController.createComment
  );
  app.get(
    "/crm/api/v1/tickets/:ticketId/comments",
    [authJwt.verifyToken],
    commentController.fetchComments
  );
};
