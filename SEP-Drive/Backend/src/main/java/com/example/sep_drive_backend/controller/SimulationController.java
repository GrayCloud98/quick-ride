package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.SimulationUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SimulationController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public SimulationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/simulation/update")
    public void receiveSimulationUpdate(@Payload SimulationUpdateDTO update) {
        messagingTemplate.convertAndSend("/topic/simulation/" + update.getRideId(), update);
    }
}
