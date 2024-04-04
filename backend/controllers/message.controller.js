import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const sendMessage = async (req, res) => {
    try {
        const {message} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]},
        });

        if(!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }

        res.status(201).json(newMessage);
        
        // This will take long time
        //  await conversation.save();
		//  await newMessage.save();

        // This will run in parallal means optimized
        await Promise.all([conversation.save(), newMessage.save()]);

    } catch (error) {
        console.log('Error in sendMessage controller: ', error.message);
        res.status(500).json({error: "internal server error"});
    }
}

export const getMessages = async(req, res) => {
    try {
        const {id: usertoChatId} = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: {$all: [senderId, usertoChatId]},
        }).populate("messages");

        if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

        res.status(200).json(messages);

    } catch (error) {
        console.log('Error in sendMessage controller: ', error.message);
        res.status(500).json({error: "internal server error"});
    }
}