package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.ChatMessageDTO;
import com.example.sep_drive_backend.dto.EditMessagePayload;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.services.ChatService;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate,
                          JwtTokenProvider jwtTokenProvider) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessageDTO dto) {
        ChatMessageDTO saved = chatService.sendMessage(dto);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getSenderUsername(), saved);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getReceiverUsername(), saved);
    }

    @MessageMapping("/chat/edit")
    public void editMessage(@Payload EditMessagePayload payload, @Header("Authorization") String token) {
        String username = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        ChatMessageDTO edited = chatService.editMessage(payload.getMessageId(), username, payload.getNewContent());

        messagingTemplate.convertAndSend("/topic/chat/" + edited.getReceiverUsername(), edited);
        messagingTemplate.convertAndSend("/topic/chat/" + edited.getSenderUsername(), edited);
    }

    @MessageMapping("/chat/delete")
    public void deleteMessage(@Payload Map<String, Object> payload, @Header("Authorization") String token) {
        String username = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        String otherUsername = payload.get("otherUsername").toString();

        chatService.deleteMessage(messageId, username);

        Map<String, Object> deletion = new HashMap<>();
        deletion.put("messageId", messageId);
        deletion.put("action", "delete");

        messagingTemplate.convertAndSend("/topic/chat/" + username, deletion);
        messagingTemplate.convertAndSend("/topic/chat/" + otherUsername, deletion);
    }
    @MessageMapping("/chat/read")
    public void markAsRead(@Payload Map<String, Object> payload, @Header("Authorization") String token) {
        String username = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        Long messageId = Long.valueOf(payload.get("messageId").toString());

        ChatMessageDTO updated = chatService.markMessageAsRead(messageId, username);

        messagingTemplate.convertAndSend("/topic/chat/" + updated.getSenderUsername(), updated);
        messagingTemplate.convertAndSend("/topic/chat/" + updated.getReceiverUsername(), updated);
    }

}

