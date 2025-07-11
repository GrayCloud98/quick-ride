package com.example.sep_drive_backend.dto;

import com.example.sep_drive_backend.models.ChatMessage;

import java.time.LocalDateTime;

public class ChatMessageDTO {

    private Long id;
    private String senderUsername;
    private String recipientUsername;
    private String content;
    private String chatId;
    private LocalDateTime timestamp;
    private boolean read;
    private boolean edited;
    private boolean deleted;

    public ChatMessageDTO(ChatMessage message) {
        this.id = message.getId();
        this.senderUsername = message.getSenderUsername();
        this.recipientUsername = message.getReceiverUsername();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
        this.read = message.isRead();
        this.edited = message.isEdited();
        this.deleted = message.isDeleted();
        this.chatId = computeChatId(this.senderUsername, this.recipientUsername);
    }

    private String computeChatId(String user1, String user2) {
        return "offer-" + (user1.compareToIgnoreCase(user2) < 0 ? user1 + "-" + user2 : user2 + "-" + user1);
    }

    public ChatMessageDTO() {}
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getSenderUsername() {
        return senderUsername;
    }
    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }
    public String getRecipientUsername() {
        return recipientUsername;
    }
    public void setRecipientUsername(String receiverUsername) {
        this.recipientUsername = receiverUsername;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public boolean isRead() {
        return read;
    }
    public void setRead(boolean read) {
        this.read = read;
    }
    public boolean isEdited() {
        return edited;
    }
    public void setEdited(boolean edited) {
        this.edited = edited;
    }
    public boolean isDeleted() {
        return deleted;
    }
    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
    public String getChatId() {
        return chatId;
    }
}

