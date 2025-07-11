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

    private void sendToBothUsers(String sender, String recipient, Object payload) {
        String topic1 = "/topic/chat/offer-" + sender + "-" + recipient;
        String topic2 = "/topic/chat/offer-" + recipient + "-" + sender;
        messagingTemplate.convertAndSend(topic1, payload);
        messagingTemplate.convertAndSend(topic2, payload);
    }

    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessageDTO dto) {
        System.out.println("[RECEIVED] " + dto);
        ChatMessageDTO saved = chatService.sendMessage(dto);
        sendToBothUsers(saved.getSenderUsername(), saved.getRecipientUsername(), saved);
    }

    @MessageMapping("/chat/edit")
    public void editMessage(@Payload EditMessagePayload payload, @Header("Authorization") String token) {
        String username = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        ChatMessageDTO edited = chatService.editMessage(payload.getMessageId(), username, payload.getNewContent());
        sendToBothUsers(edited.getSenderUsername(), edited.getRecipientUsername(), edited);
    }

    @MessageMapping("/chat/delete")
    public void deleteMessage(@Payload Map<String, Object> payload, @Header("Authorization") String token) {
        String username = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        Long messageId = Long.valueOf(payload.get("messageId").toString());

        ChatMessageDTO updated = chatService.deleteMessage(messageId, username);
        sendToBothUsers(updated.getSenderUsername(), updated.getRecipientUsername(), updated);
    }

    @MessageMapping("/chat/read")
    public void markAsRead(@Payload Map<String, Object> payload) {
        System.out.println("[WS PAYLOAD] >>> " + payload);

        String token = (String) payload.get("token");
        String username = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        Long messageId = Long.valueOf(payload.get("messageId").toString());

        ChatMessageDTO updated = chatService.markMessageAsRead(messageId, username);
        sendToBothUsers(updated.getSenderUsername(), updated.getRecipientUsername(), updated);
    }
}
