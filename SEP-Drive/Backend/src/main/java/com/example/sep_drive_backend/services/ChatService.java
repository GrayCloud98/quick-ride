package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.dto.ChatMessageDTO;
import com.example.sep_drive_backend.models.ChatMessage;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.repository.ChatMessageRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.RideOfferRepository;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;
    private final DriverRepository driverRepository;
    public ChatService(ChatMessageRepository chatMessageRepository,
                       RideOfferRepository rideOfferRepository,
                       RideRequestRepository rideRequestRepository, DriverRepository driverRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.driverRepository = driverRepository;
    }

    private void validateChatPermission(String sender, String receiver) {
        System.out.println("[DEBUG] Validating chat between sender: " + sender + " and receiver: " + receiver);

        boolean existsInEitherDirection =
                rideOfferRepository.existsByDriverUsernameAndCustomerUsername(sender, receiver) ||
                        rideOfferRepository.existsByDriverUsernameAndCustomerUsername(receiver, sender);

        if (!existsInEitherDirection) {
            throw new IllegalStateException("Chat not allowed: No RideOffer exists between users.");
        }

        System.out.println("[DEBUG] Chat permission granted between " + sender + " and " + receiver);
    }


    public ChatMessageDTO sendMessage(ChatMessageDTO dto) {
        validateChatPermission(dto.getSenderUsername(), dto.getRecipientUsername());

        ChatMessage message = new ChatMessage();
        message.setSenderUsername(dto.getSenderUsername());
        message.setReceiverUsername(dto.getRecipientUsername());
        message.setContent(dto.getContent());
        message.setRead(false);
        message.setEdited(false);
        message.setDeleted(false);

        ChatMessage saved = chatMessageRepository.save(message);
        return new ChatMessageDTO(saved);
    }

    public List<ChatMessageDTO> getConversation(String user1, String user2) {
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderUsernameAndReceiverUsernameOrReceiverUsernameAndSenderUsernameOrderByTimestampAsc(
                        user1, user2, user1, user2
                );
        return messages.stream().map(ChatMessageDTO::new).collect(Collectors.toList());
    }

    public ChatMessageDTO editMessage(Long messageId, String username, String newContent) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new NoSuchElementException("Message not found"));

        if (!message.getSenderUsername().equals(username)) {
            throw new IllegalStateException("Only sender can edit");
        }
        if (message.isRead() || message.isDeleted()) {
            throw new IllegalStateException("Cannot edit a read or deleted message");
        }

        message.setContent(newContent);
        message.setEdited(true);
        return new ChatMessageDTO(chatMessageRepository.save(message));
    }

    public ChatMessageDTO deleteMessage(Long messageId, String username) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new NoSuchElementException("Message not found"));

        if (!message.getSenderUsername().equals(username)) {
            throw new IllegalStateException("Only sender can delete");
        }
        if (message.isRead() || message.isDeleted()) {
            throw new IllegalStateException("Cannot delete a read or already deleted message");
        }

        message.setDeleted(true);
        ChatMessage saved = chatMessageRepository.save(message);
        return new ChatMessageDTO(saved);
    }

    public ChatMessageDTO markMessageAsRead(Long messageId, String username) {
        System.out.println("[🔥 markMessageAsRead CALLED] msgId=" + messageId + " by " + username);
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new NoSuchElementException("Message not found"));

        System.out.println("[MARK READ] Attempt by: " + username + " for msg " + messageId);

        if (!message.getReceiverUsername().equals(username)) {
            System.out.println("[MARK READ] ❌ Not recipient: " + message.getReceiverUsername());
            throw new IllegalStateException("Only receiver can mark the message as read");
        }

        if (!message.isRead()) {
            message.setRead(true);
            ChatMessage updated = chatMessageRepository.save(message);
            System.out.println("[MARK READ] ✅ Updated: " + updated.isRead());
            return new ChatMessageDTO(updated);
        } else {
            System.out.println("[MARK READ] Already marked as read");
        }

        return new ChatMessageDTO(message);
    }
}
