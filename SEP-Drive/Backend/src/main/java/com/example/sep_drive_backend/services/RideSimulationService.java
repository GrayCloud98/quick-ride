package com.example.sep_drive_backend.services;
import com.example.sep_drive_backend.constants.RideStatus;
import com.example.sep_drive_backend.dto.PointDTO;
import com.example.sep_drive_backend.dto.RideSimulationUpdate;
import com.example.sep_drive_backend.dto.SimulationPointsControl;
import com.example.sep_drive_backend.dto.WaypointDTO;
import com.example.sep_drive_backend.models.*;
import com.example.sep_drive_backend.repository.RideRequestRepository;
import com.example.sep_drive_backend.repository.RideSimulationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class RideSimulationService {

    private final RideSimulationRepository rideSimulationRepository;
    private final WalletService walletService;
    private final RideRequestRepository rideRequestRepository;


    @Autowired
    public RideSimulationService(RideSimulationRepository rideSimulationRepository, WalletService walletService, RideRequestRepository rideRequestRepository) {
        this.rideSimulationRepository = rideSimulationRepository;
        this.walletService = walletService;
        this.rideRequestRepository = rideRequestRepository;
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

    public void transferFees(String customerUsername, Long driverId, long priceCents) {
        walletService.transfer(customerUsername, driverId, priceCents);
    }

    public RideSimulation getSimulationById(Long id) {
        // here
        return rideSimulationRepository.findWithWaypointsById(id)
                .orElseThrow(() -> new RuntimeException("Simulation not found"));
    }

    public RideSimulation changePoints(Long id, SimulationPointsControl simPointsControl) {

        RideSimulation sim = getSimulationById(id);
        RideRequest r = sim.getRideOffer().getRideRequest();
        r.getWaypoints().clear();

        sim.setCurrentIndex(simPointsControl.getCurrentIndex());
        sim.setDestinationLocationName(simPointsControl.getDestinationLocationName());
        sim.setEndAddress(simPointsControl.getDestinationAddress());
        List<Waypoint> mappedWaypoints = simPointsControl.getWaypoints().stream()
                .map(dto -> {
                    Waypoint w = new Waypoint();
                    w.setName(dto.getName());
                    w.setAddress(dto.getAddress());
                    w.setLatitude(dto.getLatitude());
                    w.setLongitude(dto.getLongitude());
                    w.setSequenceOrder(dto.getSequenceOrder());
                    w.setRideRequest(r);
                    return w;
                }).toList();
        r.getWaypoints().addAll(mappedWaypoints);


        r.setDestinationLocationName(simPointsControl.getDestinationLocationName());
        r.setDestinationLongitude(simPointsControl.getEndPoint().getLng());
        r.setDestinationLatitude(simPointsControl.getEndPoint().getLat());

        PointDTO ep = simPointsControl.getEndPoint();
        sim.setEndPoint(new Point(ep.getLat(), ep.getLng()));

        r.setDistance(simPointsControl.getDistance());
        r.setDuration(simPointsControl.getDuration());
        r.setEstimatedPrice(simPointsControl.getPrice());
        rideRequestRepository.save(r);
        rideSimulationRepository.save(sim);
        return sim;
    }

    public RideSimulationUpdate toDto(RideSimulation sim) {
        RideSimulationUpdate dto = new RideSimulationUpdate();
        dto.setRideSimulationId(sim.getId());
        dto.setPaused(sim.isPaused());
        dto.setHasStarted(sim.isHasStarted());
        dto.setDuration(sim.getDuration());
        dto.setStartLocationName(sim.getStartLocationName());
        dto.setDestinationLocationName(sim.getDestinationLocationName());
        dto.setCurrentIndex(sim.getCurrentIndex());
        dto.setStartPoint(sim.getStartPoint());
        dto.setRideStatus(sim.getRideStatus());
        dto.setEndPoint(sim.getEndPoint());
        dto.setStartAddress(sim.getStartAddress());
        dto.setDestinationAddress(sim.getEndAddress());
        List<WaypointDTO> waypointDTOs = sim.getRideOffer().getRideRequest().getWaypoints()
                .stream()
                .map(w -> {
                    WaypointDTO wpDto = new WaypointDTO();
                    wpDto.setName(w.getName());
                    wpDto.setAddress(w.getAddress());
                    wpDto.setLatitude(w.getLatitude());
                    wpDto.setLongitude(w.getLongitude());
                    wpDto.setSequenceOrder(w.getSequenceOrder());
                    return wpDto;
                })
                .collect(Collectors.toList());

        dto.setWaypoints(waypointDTOs);

        dto.setHasChanged(sim.getHasChanged());
        return dto;
    }

}
