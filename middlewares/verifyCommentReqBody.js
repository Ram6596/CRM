/**
 * This file will contain the middlewares for validating the ticket request body
 */

const Ticket = require("../models/ticket.model");



validateCommentRequestBody = async (req, res, next) => {

    //Validating the userName
    if (!req.params.ticketId) {
        res.status(400).send({
            message: "Failed! ticket is not provided !"
        });
        return;
    }

    const ticket = await Ticket.findOne({ _id: req.params.ticketId });

    if (!ticket) {
        res.status(400).send({
            message: "Failed! ticket id doesn't exist !"
        });
        return;
    }
    if (!req.body.content) {

        res.status(400).send({
            message: "Failed! Comment content is empty !"
        });
        return;
    }

    next();


};


const verifyCommentRequestBody = {
    validateCommentRequestBody: validateCommentRequestBody


};
module.exports = verifyCommentRequestBody



