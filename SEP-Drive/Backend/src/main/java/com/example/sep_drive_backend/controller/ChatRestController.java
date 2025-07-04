package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.ChatMessageDTO;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.services.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class ChatRestController {

    private final ChatService chatService;
    private final JwtTokenProvider jwtTokenProvider;

    public ChatRestController(ChatService chatService, JwtTokenProvider jwtTokenProvider) {
        this.chatService = chatService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable String chatId,
            @RequestHeader("Authorization") String token
    ) {
        String requester = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));

        if (!chatId.contains("-")) {
            return ResponseEntity.badRequest().build();
        }

        String[] parts = chatId.replace("offer-", "").split("-");
        if (parts.length != 2) {
            return ResponseEntity.badRequest().build();
        }

        String user1 = parts[0];
        String user2 = parts[1];

        if (!requester.equals(user1) && !requester.equals(user2)) {
            return ResponseEntity.status(403).build();
        }

        List<ChatMessageDTO> messages = chatService.getConversation(user1, user2);
        return ResponseEntity.ok(messages);
    }
}
