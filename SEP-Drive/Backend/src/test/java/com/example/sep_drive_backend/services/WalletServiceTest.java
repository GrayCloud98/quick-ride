package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.TransactionType;
import com.example.sep_drive_backend.models.Customer;
import com.example.sep_drive_backend.models.Driver;
import com.example.sep_drive_backend.models.Transaction;
import com.example.sep_drive_backend.models.Wallet;
import com.example.sep_drive_backend.repository.TransactionRepository;
import com.example.sep_drive_backend.repository.UserRepository;
import com.example.sep_drive_backend.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WalletServiceTest {

    private WalletRepository walletRepo;
    private TransactionRepository transactionRepo;
    private UserRepository userRepo;

    private WalletService walletService;

    @BeforeEach
    void setUp() {
        walletRepo = mock(WalletRepository.class);
        transactionRepo = mock(TransactionRepository.class);
        userRepo = mock(UserRepository.class);

        walletService = new WalletService(walletRepo, transactionRepo, userRepo);
    }

    @Test
    void testTransferSuccessful() {
        Wallet fromWallet = new Wallet();
        fromWallet.setBalanceCents(10_000);

        Customer fromCustomer = new Customer();
        fromCustomer.setWallet(fromWallet);


        Wallet toWallet = new Wallet();
        toWallet.setBalanceCents(5_000);

        Driver toDriver = new Driver();
        toDriver.setWallet(toWallet);

        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(fromCustomer));
        when(userRepo.findById(2L)).thenReturn(Optional.of(toDriver));

        when(walletRepo.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepo.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        walletService.transfer("alice", 2L, 3_000); // 30 EUR

        assertEquals(7_000, fromWallet.getBalanceCents()); // 100 - 30 = 70 EUR
        assertEquals(8_000, toWallet.getBalanceCents());   // 50 + 30 = 80 EUR

        verify(transactionRepo, times(2)).save(any(Transaction.class));
        verify(walletRepo, times(2)).save(any(Wallet.class));
    }

    @Test
    void testTransferFailsOnInsufficientBalance() {
        Wallet fromWallet = new Wallet();
        fromWallet.setBalanceCents(2_000); // 20 EUR

        Customer fromCustomer = new Customer();
        fromCustomer.setWallet(fromWallet);

        Wallet toWallet = new Wallet();
        toWallet.setBalanceCents(5_000);

        Driver toDriver = new Driver();
        toDriver.setWallet(toWallet);

        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(fromCustomer));
        when(userRepo.findById(2L)).thenReturn(Optional.of(toDriver));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> walletService.transfer("alice", 2L, 3_000));

        assertEquals("Insufficient balance.", ex.getMessage());

        verify(walletRepo, never()).save(any());
        verify(transactionRepo, never()).save(any());
    }

    @Test
    void testTransferFailsIfFromWalletNotFound() {
        when(userRepo.findByUsername("alice")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> walletService.transfer("alice", 2L, 1_000));

        assertTrue(ex.getMessage().contains("Sender wallet not found"));
    }

    @Test
    void testTransferFailsIfToWalletNotFound() {
        Wallet fromWallet = new Wallet();
        fromWallet.setBalanceCents(5_000);

        Customer fromCustomer = new Customer();
        fromCustomer.setWallet(fromWallet);

        when(userRepo.findByUsername("alice")).thenReturn(Optional.of(fromCustomer));
        when(userRepo.findById(2L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> walletService.transfer("alice", 2L, 1_000));

        assertTrue(ex.getMessage().contains("Receiver wallet not found"));
    }

    @Test
    void testTransferFailsOnNonPositiveAmount() {
        IllegalArgumentException ex1 = assertThrows(IllegalArgumentException.class,
                () -> walletService.transfer("alice", 2L, 0));
        assertEquals("Transfer amount must be greater than zero.", ex1.getMessage());

        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class,
                () -> walletService.transfer("alice", 2L, -100));
        assertEquals("Transfer amount must be greater than zero.", ex2.getMessage());
    }
}
