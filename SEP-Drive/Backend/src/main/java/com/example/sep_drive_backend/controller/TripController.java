package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.TripeDTO;
import com.example.sep_drive_backend.dto.TripCompleteRequest;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.services.TripService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;



    @PostMapping("/complete")
    public ResponseEntity<Void> completeTrip(@RequestBody TripCompleteRequest request, HttpServletRequest httpRequest) {
        String token = jwtTokenProvider.resolveToken(httpRequest);
        String username = jwtTokenProvider.getUsername(token);


        tripService.completeTrip(request);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/history")
    public ResponseEntity<List<TripeDTO>> getTripHistory(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);

        List<TripeDTO> history = tripService.getTripHistoryForUser(username);
        return ResponseEntity.ok(history);
    }

}
