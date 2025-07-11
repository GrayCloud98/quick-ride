package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.dto.LeaderboardEntryDTO;
import com.example.sep_drive_backend.models.JwtTokenProvider;
import com.example.sep_drive_backend.services.LeaderboardService;
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
    @Autowired
    private LeaderboardService leaderboardService;



    public TripController(TripService tripService, JwtTokenProvider jwtTokenProvider, LeaderboardService leaderboardService) {
        this.tripService = tripService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.leaderboardService = leaderboardService;
    }








    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        String username = jwtTokenProvider.getUsername(token);
        return ResponseEntity.ok(leaderboardService.getLeaderboard());
    }




}
