package com.example.sep_drive_backend.controller;
import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.constants.TripsStatus;
import com.example.sep_drive_backend.dto.RideSimulationUpdate;
import com.example.sep_drive_backend.dto.SimulationControlMessage;
import com.example.sep_drive_backend.dto.SimulationErrorMessage;
import com.example.sep_drive_backend.dto.SimulationPointsControl;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.models.Trips;
import com.example.sep_drive_backend.repository.*;
import com.example.sep_drive_backend.services.RideSimulationService;
import jakarta.transaction.Transactional;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.Optional;

@Controller
public class RideSimulationController {

    private final RideSimulationService rideSimulationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RideSimulationRepository rideSimulationRepository;
    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final ChatMessageRepository chatMessageRepository;
    public RideSimulationController(RideSimulationService rideSimulationService,
                                    SimpMessagingTemplate messagingTemplate, RideSimulationRepository rideSimulationRepository, RideOfferRepository rideOfferRepository, RideRequestRepository rideRequestRepository, CustomerRepository customerRepository, DriverRepository driverRepository, TripRepository tripRepository, ChatMessageRepository chatMessageRepository) {
        this.rideSimulationService = rideSimulationService;
        this.messagingTemplate = messagingTemplate;
        this.rideSimulationRepository = rideSimulationRepository;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/simulation/fetch")
    public void fetchSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.getSimulationById(msg.getRideSimulationId());
        messagingTemplate.convertAndSend("/topic/simulation/" + sim.getId(), rideSimulationService.toDto(sim));
    }

    @MessageMapping("/simulation/start")
    public void startSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.startSimulation(msg.getRideSimulationId());
        sim.setCurrentIndex(msg.getCurrentIndex());
        rideSimulationRepository.save(sim);
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/resume")
    public void resumeSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.resumeSimulation(msg.getRideSimulationId());
        sim.setCurrentIndex(msg.getCurrentIndex());
        rideSimulationRepository.save(sim);
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/pause")
    public void pauseSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.pauseSimulation(msg.getRideSimulationId());
        sim.setCurrentIndex(msg.getCurrentIndex());
        rideSimulationRepository.save(sim);
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/speed")
    public void changeSpeed(@Payload SpeedChangeMessage msg) {
        RideSimulation sim = rideSimulationService.changeDuration(msg.getRideSimulationId(), msg.getDuration());
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/change-points")
    public void changePoints(@Payload SimulationPointsControl msg) {
        RideSimulation sim = rideSimulationService.changePoints(msg.getRideSimulationId(), msg);
        broadcastChangedUpdate(sim);
    }

    @Transactional
    @MessageMapping("/simulation/complete")
    public void completeSimulation(@Payload SimulationControlMessage msg) {
        Optional<RideSimulation> optionalSim = rideSimulationRepository.findById(msg.getRideSimulationId());
        if (optionalSim.isEmpty()) {
            return;
        }

        RideSimulation simulation = optionalSim.get();
        if (simulation.getRideStatus() == RideStatus.COMPLETED) {
            return;
        }
        double estimatedPriceInCents = 100 * simulation.getRideOffer().getRideRequest().getEstimatedPrice();
        if (simulation.getCustomer().getWallet().getBalanceCents() < estimatedPriceInCents){
            SimulationErrorMessage error = new SimulationErrorMessage();
            error.setMessage("Insufficient Customer balance to complete the Ride.");
            error.setCustomerBalance(simulation.getCustomer().getWallet().getBalanceCents());
            error.setPrice(estimatedPriceInCents);
            messagingTemplate.convertAndSend("/topic/simulation/" + simulation.getId(), error);
            return;
        }

        simulation.setRideStatus(RideStatus.COMPLETED);
        simulation.getRideOffer().setRideStatus(RideStatus.COMPLETED);
        simulation.getRideOffer().getRideRequest().setRideStatus(RideStatus.COMPLETED);
        simulation.setPaused(true);
        simulation.getRideOffer().getRideRequest().markEnded();
        simulation.markEnded();
        long priceCents = Math.round(simulation.getRideOffer().getRideRequest().getEstimatedPrice() * 100);
        String customerUsername = simulation.getCustomer().getUsername();
        Long driverUserId = simulation.getDriver().getId();
        rideSimulationService.transferFees(customerUsername, driverUserId, priceCents);
        Customer customer = simulation.getCustomer();
        int customerOldTotalRides = customer.getTotalRides();
        customer.setTotalRides(customerOldTotalRides + 1);
        customer.setActive(false);
        customerRepository.save(customer);
        Driver driver = simulation.getDriver();
        int driverOldTotalRides = driver.getTotalRides();
        driver.setTotalRides(driverOldTotalRides + 1);
        Double oldTotalTravelledDistance = driver.getTotalTravelledDistance();
        driver.setTotalTravelledDistance(oldTotalTravelledDistance + simulation.getRideOffer().getRideRequest().getDistance());
        driver.setActive(false);
        driverRepository.save(driver);

        Trips trip = new Trips();
        trip.setDriver(driver);
        trip.setCustomer(customer);
        trip.setStatus(TripsStatus.COMPLETED);
        trip.setEndTime(simulation.getRideOffer().getRideRequest().getEndedAt());
        trip.setDistanceKm(simulation.getRideOffer().getRideRequest().getDistance());
        trip.setDurationMin(simulation.getRideOffer().getRideRequest().getDuration());
        trip.setPriceEuro(simulation.getRideOffer().getRideRequest().getEstimatedPrice());
        trip.setDriverFullName(simulation.getRideOffer().getDriver().getFirstName() + " " + simulation.getRideOffer().getDriver().getLastName());
        trip.setCustomerFullName(simulation.getRideOffer().getRideRequest().getCustomer().getFirstName() + " " + simulation.getCustomer().getLastName());
        trip.setId(simulation.getRideOffer().getRideRequest().getId());
        trip.setCustomerUsername(simulation.getCustomer().getUsername());
        tripRepository.save(trip);
        rideSimulationRepository.save(simulation);
        rideOfferRepository.save(simulation.getRideOffer());
        rideRequestRepository.save(simulation.getRideOffer().getRideRequest());

        broadcastUpdate(simulation);
        chatMessageRepository.deleteAll();
    }


    private void broadcastUpdate(RideSimulation sim) {
        RideSimulationUpdate update = rideSimulationService.toDto(sim);
        messagingTemplate.convertAndSend("/topic/simulation/" + sim.getId(), update);
    }


    private void broadcastChangedUpdate(RideSimulation sim) {
        RideSimulationUpdate update = rideSimulationService.toDto(sim);
        update.setHasChanged(true);
        messagingTemplate.convertAndSend("/topic/simulation/" + sim.getId(), update);
    }


    public static class SpeedChangeMessage {
        private Long rideSimulationId;
        private double duration;

        public Long getRideSimulationId() { return rideSimulationId; }
        public void setRideSimulationId(Long id) { this.rideSimulationId = id; }

        public double getDuration() { return duration; }
        public void setDuration(double duration) { this.duration = duration; }
    }
}
