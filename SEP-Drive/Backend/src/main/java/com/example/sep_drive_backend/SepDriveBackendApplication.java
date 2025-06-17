package com.example.sep_drive_backend;

import com.example.sep_drive_backend.constants.RoleEnum;
import com.example.sep_drive_backend.constants.TripsStatus;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.Trips;
import com.example.sep_drive_backend.models.User;
import com.example.sep_drive_backend.repository.TripRepository;
import com.example.sep_drive_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

@SpringBootApplication
public class SepDriveBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SepDriveBackendApplication.class, args);
    }

//    @Bean
//    public CommandLineRunner seedDatabase(UserRepository userRepository, TripRepository tripsRepository, PasswordEncoder encoder) {
//        return args -> {
//            Map<String, User> kunden = new HashMap<>();
//            Map<String, User> fahrer = new HashMap<>();
//
//            // 🔹 Kunden anlegen
//            kunden.put("kunde1", createUser(userRepository, encoder, "kunde1", "Anna", "Musterfrau", "anna@example.com", RoleEnum.Customer, 1990, Calendar.JANUARY, 1));
//            kunden.put("kunde2", createUser(userRepository, encoder, "kunde2", "Ben", "Beispiel", "ben@example.com", RoleEnum.Customer, 1992, Calendar.APRIL, 12));
//            kunden.put("kunde3", createUser(userRepository, encoder, "kunde3", "Carla", "Test", "carla@example.com", RoleEnum.Customer, 1995, Calendar.JUNE, 23));
//
//            // 🔹 Fahrer anlegen
//            fahrer.put("fahrer1", createUser(userRepository, encoder, "fahrer1", "David", "Drive", "david@example.com", RoleEnum.Driver, 1985, Calendar.MAY, 20));
//            fahrer.put("fahrer2", createUser(userRepository, encoder, "fahrer2", "Eva", "Fahrerin", "eva@example.com", RoleEnum.Driver, 1988, Calendar.DECEMBER, 5));
//
//            // 🔹 Beispiel-Fahrten (Trips)
//            if (tripsRepository.count() == 0) {
//                Trips trip1 = createTrip(kunden.get("kunde1"), fahrer.get("fahrer1"), 10.5, 20, 15.0, 5, 5);
//                Trips trip2 = createTrip(kunden.get("kunde2"), fahrer.get("fahrer2"), 8.0, 18, 12.0, 4, 4);
//                Trips trip3 = createTrip(kunden.get("kunde3"), fahrer.get("fahrer1"), 6.5, 15, 9.0, 5, 3);
//                Trips trip4 = createTrip(kunden.get("kunde1"), fahrer.get("fahrer2"), 14.2, 30, 20.0, 3, 5);
//
//                tripsRepository.saveAll(Arrays.asList(trip1, trip2, trip3, trip4));
//            }
//        };
//    }
//
//    private User createUser(UserRepository repo, PasswordEncoder encoder, String username, String firstName, String lastName, String email, RoleEnum role, int year, int month, int day) {
//        return repo.findByUsername(username).orElseGet(() -> {
//            User user = role == RoleEnum.Customer ? new Customer() : new Driver();
//            user.setUsername(username);
//            user.setPassword(encoder.encode("test123"));
//            user.setFirstName(firstName);
//            user.setLastName(lastName);
//            user.setEmail(email);
//            user.setRole(role);
//
//            Calendar cal = Calendar.getInstance();
//            cal.set(year, month, day);
//            user.setBirthDate(cal.getTime());
//
//            return repo.save(user);
//        });
//    }
//
//    private Trips createTrip(User customer, User driver, double distance, long duration, double price, int custRating, int drvRating) {
//        Trips trip = new Trips();
//        trip.setCustomer(customer);
//        trip.setDriver(driver);
//        trip.setDistanceKm(distance);
//        trip.setDurationMin(duration);
//        trip.setPriceEuro(price);
//        trip.setCustomerRating(custRating);
//        trip.setDriverRating(drvRating);
//        trip.setStatus(TripsStatus.COMPLETED);
//        trip.setProgress(100);
//        trip.setSpeed(30);
//        trip.setEndTime(LocalDateTime.now().minusMinutes(new Random().nextInt(60)));
//
//
//        trip.setCustomerUsername(customer.getUsername());
//        trip.setCustomerFullName(customer.getFirstName() + " " + customer.getLastName());
//
//        trip.setDriverUsername(driver.getUsername());
//        trip.setDriverFullName(driver.getFirstName() + " " + driver.getLastName());
//
//        return trip;
//    }
}
