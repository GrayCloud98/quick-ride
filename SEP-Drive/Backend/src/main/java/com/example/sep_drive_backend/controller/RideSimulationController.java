package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.dto.RideSimulationUpdate;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.repository.*;
import com.example.sep_drive_backend.services.LoginService;
import com.example.sep_drive_backend.services.RideSimulationService;
import com.example.sep_drive_backend.services.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Controller
public class RideSimulationController {

    private final RideSimulationService rideSimulationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RideSimulationRepository rideSimulationRepository;
    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;
    private final LoginService loginService;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final WalletService walletService;

    public RideSimulationController(RideSimulationService rideSimulationService,
                                    SimpMessagingTemplate messagingTemplate, RideSimulationRepository rideSimulationRepository, RideOfferRepository rideOfferRepository, RideRequestRepository rideRequestRepository, LoginService loginService, CustomerRepository customerRepository, DriverRepository driverRepository, DriverRepository driverRepository1, WalletService walletService) {
        this.rideSimulationService = rideSimulationService;
        this.messagingTemplate = messagingTemplate;
        this.rideSimulationRepository = rideSimulationRepository;
        this.rideOfferRepository = rideOfferRepository;
        this.rideRequestRepository = rideRequestRepository;
        this.loginService = loginService;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.walletService = walletService;
    }

    @MessageMapping("/simulation/fetch")
    public void fetchSimulation(@Payload Long simId) {
        RideSimulation sim = rideSimulationService.getSimulationById(simId);
        messagingTemplate.convertAndSend("/topic/simulation/" + sim.getId(), rideSimulationService.toDto(sim));
    }

    @MessageMapping("/simulation/start")
    public void startSimulation(@Payload Long simId) {
        RideSimulation sim = rideSimulationService.startSimulation(simId);
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/resume")
    public void resumeSimulation(@Payload Long simId) {
        RideSimulation sim = rideSimulationService.resumeSimulation(simId);
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/pause")
    public void pauseSimulation(@Payload Long simId) {
        RideSimulation sim = rideSimulationService.pauseSimulation(simId);
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/speed")
    public void changeSpeed(@Payload SpeedChangeMessage msg) {
        RideSimulation sim = rideSimulationService.changeDuration(msg.getRideSimulationId(), msg.getDuration());
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/complete")
    public void completeSimulation(@Payload Long simId) {
        Optional<RideSimulation> optionalSim = rideSimulationRepository.findById(simId);
        if (optionalSim.isEmpty()) {
            return;
        }

        RideSimulation simulation = optionalSim.get();
        simulation.setRideStatus(RideStatus.COMPLETED);
        simulation.getRideOffer().setRideStatus(RideStatus.COMPLETED);
        simulation.getRideOffer().getRideRequest().setRideStatus(RideStatus.COMPLETED);
        simulation.markEnded();

        long priceCents = Math.round(simulation.getRideOffer().getRideRequest().getEstimatedPrice() * 100);
        String customerUsername = simulation.getCustomer().getUsername();
        Long driverUserId = simulation.getDriver().getId();
        walletService.transfer(customerUsername, driverUserId, priceCents);

        rideSimulationRepository.save(simulation);
        rideOfferRepository.save(simulation.getRideOffer());
        rideRequestRepository.save(simulation.getRideOffer().getRideRequest());

        broadcastCompleteUpdate(simulation);
    }


    private void broadcastUpdate(RideSimulation sim) {
        RideSimulationUpdate update = rideSimulationService.toDto(sim);
        messagingTemplate.convertAndSend("/topic/simulation/" + sim.getId(), update);
    }


    private void broadcastCompleteUpdate(RideSimulation sim) {
        RideSimulationUpdate update = rideSimulationService.completedToDto(sim);
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
