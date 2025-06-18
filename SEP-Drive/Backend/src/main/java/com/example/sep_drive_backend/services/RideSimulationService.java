package com.example.sep_drive_backend.services;
import com.example.sep_drive_backend.dto.RideSimulationUpdate;
import com.example.sep_drive_backend.models.RideSimulation;
import com.example.sep_drive_backend.repository.RideSimulationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;


@Service
public class RideSimulationService {

    private final RideSimulationRepository rideSimulationRepository;

    @Autowired
    public RideSimulationService(RideSimulationRepository rideSimulationRepository) {
        this.rideSimulationRepository = rideSimulationRepository;
    }

    public RideSimulation startSimulation(Long id, int currentIndex) {
        RideSimulation sim = getSimulationById(id);
        sim.setPaused(false);
        sim.markStarted();
        sim.setCurrentIndex(currentIndex);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulation pauseSimulation(Long id, int currentIndex) {
        RideSimulation sim = getSimulationById(id);
        sim.setPaused(true);
        sim.setCurrentIndex(currentIndex);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulation resumeSimulation(Long id, int currentIndex) {
        RideSimulation sim = getSimulationById(id);
        sim.setPaused(false);
        sim.setCurrentIndex(currentIndex);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulation changeDuration(Long id, double duration) {
        RideSimulation sim = getSimulationById(id);
        sim.setDuration(Math.min(30, Math.max(3, duration)));
        rideSimulationRepository.save(sim);
        return sim;
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
        dto.setCurrentIndex(sim.getCurrentIndex());
        dto.setDuration(sim.getDuration());
        dto.setStartPoint(sim.getStartPoint());
        dto.setEdndPoint(sim.getEndPoint());
        return dto;
    }

}
