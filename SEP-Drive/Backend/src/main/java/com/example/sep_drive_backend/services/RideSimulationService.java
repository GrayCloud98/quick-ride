package com.example.sep_drive_backend.services;
import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.dto.RideSimulationUpdate;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.repository.CustomerRepository;
import com.example.sep_drive_backend.repository.DriverRepository;
import com.example.sep_drive_backend.repository.RideSimulationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class RideSimulationService {

    private final RideSimulationRepository rideSimulationRepository;
    private final DriverRepository driverRepository;
    private final CustomerRepository customerRepository;

    @Autowired
    public RideSimulationService(RideSimulationRepository rideSimulationRepository, DriverRepository driverRepository, CustomerRepository customerRepository) {
        this.rideSimulationRepository = rideSimulationRepository;
        this.driverRepository = driverRepository;
        this.customerRepository = customerRepository;
    }

    public RideSimulation startSimulation(Long id) {
        RideSimulation sim = getSimulationById(id);
        sim.setPaused(false);
        sim.markStarted();
        sim.setRideStatus(RideStatus.IN_PROGRESS);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulation pauseSimulation(Long id) {
        RideSimulation sim = getSimulationById(id);
        sim.setPaused(true);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulation resumeSimulation(Long id) {
        RideSimulation sim = getSimulationById(id);
        sim.setPaused(false);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulation changeDuration(Long id, double duration) {
        RideSimulation sim = getSimulationById(id);
        sim.setDuration(Math.min(30, Math.max(3, duration)));
        rideSimulationRepository.save(sim);
        return sim;
    }



    public void rateDriver(Long rideSimulationId, String customerUsername, int rate) {
        RideSimulation sim = rideSimulationRepository.findById(rideSimulationId)
                .orElseThrow(() -> new RuntimeException("RideSimulation not found"));

        if (!sim.getCustomer().getUsername().equals(customerUsername)) {
            throw new RuntimeException("You are not the customer for this simulation");
        }

        sim.getDriver().setRating(sim.getDriver().getRating() + rate);
        driverRepository.save(sim.getDriver());
    }

    public void rateCustomer(Long rideSimulationId, String driverUsername, int rate) {
        RideSimulation sim = rideSimulationRepository.findById(rideSimulationId)
                .orElseThrow(() -> new RuntimeException("RideSimulation not found"));

        if (!sim.getDriver().getUsername().equals(driverUsername)) {
            throw new RuntimeException("You are not the Driver for this simulation");
        }

        sim.getCustomer().setRating(sim.getCustomer().getRating() + rate);
        customerRepository.save(sim.getCustomer());
    }

    public RideSimulation getSimulationById(Long id) {
        Optional<RideSimulation> simOpt = rideSimulationRepository.findById(id);
        if (simOpt.isEmpty()) throw new RuntimeException("Simulation not found");
        return simOpt.get();
    }

    public RideSimulationUpdate toDto(RideSimulation sim) {
        RideSimulationUpdate dto = new RideSimulationUpdate();
        dto.setRideSimulationId(sim.getId());
        dto.setPaused(sim.isPaused());
        dto.setHasStarted(sim.isHasStarted());
        dto.setDuration(sim.getDuration());
        dto.setStartLocationName(sim.getStartLocationName());
        dto.setDestinationLocationName(sim.getDestinationLocationName());
        dto.setStartPoint(sim.getStartPoint());
        sim.setRideStatus(sim.getRideStatus());
        dto.setEndPoint(sim.getEndPoint());
        return dto;
    }

    public RideSimulationUpdate completedToDto(RideSimulation sim) {
        RideSimulationUpdate dto = new RideSimulationUpdate();
        dto.setRideSimulationId(sim.getId());
        dto.setPaused(sim.isPaused());
        dto.setHasStarted(sim.isHasStarted());
        dto.setDuration(sim.getDuration());
        dto.setStartPoint(sim.getStartPoint());
        dto.setEndPoint(sim.getEndPoint());
        dto.setStartLocationName(sim.getStartLocationName());
        dto.setDestinationLocationName(sim.getDestinationLocationName());
        dto.setRideStatus(RideStatus.COMPLETED);
        return dto;
    }

}
