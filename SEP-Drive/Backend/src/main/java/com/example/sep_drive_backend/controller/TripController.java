package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.TripeDTO;
import com.example.sep_drive_backend.dto.TripCompleteRequest;
import com.example.sep_drive_backend.services.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200") // für das Angular-Frontend
@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    /**
     * 🚗 POST-Request: Fahrt abschließen (kommt vom Frontend)
     * URL: POST /api/trips/complete
     */
    @PostMapping("/complete")
    public ResponseEntity<Void> completeTrip(@RequestBody TripCompleteRequest tripData) {
        tripService.completeTrip(tripData);
        return ResponseEntity.ok().build();
    }

    /**
     * 📋 GET-Request: Fahrthistorie eines Nutzers (Kunde oder Fahrer)
     * URL: GET /api/trips/history/{username}
     */
    @GetMapping("/history/{username}")
    public ResponseEntity<List<TripeDTO>> getTripHistory(@PathVariable String username) {
        List<TripeDTO> history = tripService.getTripHistoryForUser(username);
        return ResponseEntity.ok(history);
    }
}
