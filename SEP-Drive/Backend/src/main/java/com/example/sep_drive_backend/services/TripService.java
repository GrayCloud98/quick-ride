package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.TripsStatus;
import com.example.sep_drive_backend.dto.TripeDTO;
import com.example.sep_drive_backend.dto.TripCompleteRequest;
import com.example.sep_drive_backend.models.Trips;
import com.example.sep_drive_backend.models.User;
import com.example.sep_drive_backend.repository.TripRepository;
import com.example.sep_drive_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;





}