package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.Ridestatus;
import com.example.sep_drive_backend.models.*;
import com.example.sep_drive_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RideRequestServiceTest {

    @Mock
    private RideRequestRepository rideRequestRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private RideRequestService rideRequestService;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private RideOfferRepository rideOfferRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void completeRide_successfulCompletion_updatesWalletsAndStatus() {

        Wallet customerWallet = new Wallet();
        customerWallet.setBalanceCents(10000L);


        Wallet driverWallet = new Wallet();
        driverWallet.setBalanceCents(5000L);


        Customer customer = new Customer();
        customer.setWallet(customerWallet);

        Driver driver = new Driver();
        driver.setWallet(driverWallet);


        RideOffer rideOffer = new RideOffer();
        rideOffer.setDriver(driver);


        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(1L);
        rideRequest.setCustomer(customer);
        rideRequest.setRideOffer(rideOffer);
        rideRequest.setStatus(Ridestatus.IN_PROGRESS);
        rideRequest.setEstimatedPrice(25.50); // 25.50 EUR


        when(rideRequestRepository.findById(1L)).thenReturn(Optional.of(rideRequest));


        rideRequestService.completeRide(1L);


        assertEquals(10000L - 2550L, customerWallet.getBalanceCents());
        assertEquals(5000L + 2550L, driverWallet.getBalanceCents());


        assertEquals(Ridestatus.COMPLETED, rideRequest.getStatus());


        verify(walletRepository).save(customerWallet);
        verify(walletRepository).save(driverWallet);
        verify(rideRequestRepository).save(rideRequest);
    }

    @Test
    void completeRide_rideAlreadyCompleted_doesNothing() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(2L);
        rideRequest.setStatus(Ridestatus.COMPLETED);

        when(rideRequestRepository.findById(2L)).thenReturn(Optional.of(rideRequest));

        rideRequestService.completeRide(2L);


        assertEquals(Ridestatus.COMPLETED, rideRequest.getStatus());


        verify(walletRepository, never()).save(any());
        verify(rideRequestRepository, never()).save(any());
    }
    @Test
    void completeRide_rideOfferOrDriverMissing_throwsException() {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(3L);
        rideRequest.setStatus(Ridestatus.IN_PROGRESS);
        rideRequest.setRideOffer(null);

        when(rideRequestRepository.findById(3L)).thenReturn(Optional.of(rideRequest));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            rideRequestService.completeRide(3L);
        });

        assertEquals("Cannot invoke \"com.example.sep_drive_backend.models.Customer.getWallet()\" because the return value of \"com.example.sep_drive_backend.models.RideRequest.getCustomer()\" is null", exception.getMessage());
    }

    @Test
    void completeRide_rideNotFound_throwsException() {
        when(rideRequestRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            rideRequestService.completeRide(999L);
        });

        assertEquals("Ride not found", exception.getMessage());
    }
    @Test
    void completeRide_missingRideOfferOrDriver_throwsException() {

        RideRequest rideRequest = new RideRequest();
        rideRequest.setId(3L);
        rideRequest.setStatus(Ridestatus.IN_PROGRESS);
        rideRequest.setCustomer(new Customer());


        rideRequest.setRideOffer(null);
        when(rideRequestRepository.findById(3L)).thenReturn(Optional.of(rideRequest));


        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            rideRequestService.completeRide(3L);
        });

        assertEquals("RideOffer or Driver not found for this ride", exception.getMessage());


        RideOffer offerWithoutDriver = new RideOffer();
        rideRequest.setRideOffer(offerWithoutDriver);

        when(rideRequestRepository.findById(3L)).thenReturn(Optional.of(rideRequest));

        exception = assertThrows(RuntimeException.class, () -> {
            rideRequestService.completeRide(3L);
        });

        assertEquals("RideOffer or Driver not found for this ride", exception.getMessage());
    }



}