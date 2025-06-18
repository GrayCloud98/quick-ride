package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.RideSimulationUpdate;
import com.example.sep_drive_backend.dto.SimulationControlMessage;
import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.services.RideSimulationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import java.util.concurrent.atomic.AtomicInteger;

@Controller
public class RideSimulationController {

    private final RideSimulationService rideSimulationService;
    private final SimpMessagingTemplate messagingTemplate;

    public RideSimulationController(RideSimulationService rideSimulationService,
                                    SimpMessagingTemplate messagingTemplate) {
        this.rideSimulationService = rideSimulationService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/simulation/fetch")
    public void fetchSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.getSimulationById(msg.getRideSimulationId());
        messagingTemplate.convertAndSend("/topic/simulation/" + sim.getId(), rideSimulationService.toDto(sim));
    }

    @MessageMapping("/simulation/start")
    public void startSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.startSimulation(msg.getRideSimulationId(), msg.getCurrentIndex());
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/resume")
    public void resumeSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.resumeSimulation(msg.getRideSimulationId(), msg.getCurrentIndex());
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/pause")
    public void pauseSimulation(@Payload SimulationControlMessage msg) {
        RideSimulation sim = rideSimulationService.pauseSimulation(msg.getRideSimulationId(), msg.getCurrentIndex());
        broadcastUpdate(sim);
    }

    @MessageMapping("/simulation/speed")
    public void changeSpeed(@Payload SpeedChangeMessage msg) {
        RideSimulation sim = rideSimulationService.changeDuration(msg.getRideSimulationId(), msg.getDuration());
        broadcastUpdate(sim);
    }

    private void broadcastUpdate(RideSimulation sim) {
        RideSimulationUpdate update = rideSimulationService.toDto(sim);
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
