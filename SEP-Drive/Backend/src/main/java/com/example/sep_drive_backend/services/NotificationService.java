package com.example.sep_drive_backend.services;
import com.example.sep_drive_backend.dto.NotificationMessage;
import com.example.sep_drive_backend.dto.RideOfferNotification;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendOfferNotification(Driver driver, RideRequest rideRequest) {
        RideOfferNotification notification = new RideOfferNotification();
        notification.setMessage("You received an Offer for your Request!");
        notification.setDriverName(driver.getFirstName() + " " + driver.getLastName());
        notification.setDriverRating(driver.getRating());
        notification.setTotalRides(driver.getTotalRides());
        notification.setTotalTravelledDistance(0);
        notification.setVehicleClass(driver.getVehicleClass());
        String customerUsername = rideRequest.getCustomer().getUsername();
        messagingTemplate.convertAndSend("/topic/customer/" + customerUsername, notification);
        System.out.println("Notification sent to customer " + customerUsername);

    }

    public void sendRejectionNotification(String username) {
        NotificationMessage message = new NotificationMessage(
                "rejection",
                "Your Offer was rejected, you can now send new Offers",
                "REJECTED",
                null
        );
        messagingTemplate.convertAndSend("/topic/driver/" + username, message);
        System.out.println("Rejection notification sent to " + username);
    }

    public void sendAcceptNotification(String username) {
        NotificationMessage message = new NotificationMessage(
                "acceptance",
                "Your Offer was accepted, you can now view your Simulation",
                "Accepted",
                username
        );
        messagingTemplate.convertAndSend("/topic/driver/" + username, message);
        System.out.println("Acceptance notification sent to " + username);
    }


    public void sendCancelledNotification(String username) {
        NotificationMessage message = new NotificationMessage(
                "cancellation",
                "An Offer for your Request was withdrawn",
                null,
                null
        );
        messagingTemplate.convertAndSend("/topic/customer/" + username, message);
        System.out.println("Cancellation notification sent to " + username);
    }
}
