package com.example.sep_drive_backend.dto;

public class EditMessagePayload {
    private Long messageId;
    private String newContent;

    public EditMessagePayload() {}
    public EditMessagePayload(Long messageId, String newContent) {
        this.messageId = messageId;
        this.newContent = newContent;
    }
    public Long getMessageId() {
        return messageId;
    }
    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }
    public String getNewContent() {
        return newContent;
    }
    public void setNewContent(String newContent) {
        this.newContent = newContent;
    }
}

