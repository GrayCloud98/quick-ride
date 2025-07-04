package com.example.sep_drive_backend.controller;

import com.example.sep_drive_backend.models.Transaction;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.sep_drive_backend.services.WalletService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:4200")

public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance")
    public ResponseEntity<Long> getBalance() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        long balance = walletService.getBalance(username);
        return ResponseEntity.ok(balance);
    }

    @PostMapping("/deposit")
    public ResponseEntity<Void> deposit(@RequestParam long amountCents) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        walletService.deposit(username, amountCents);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(
            @RequestParam Long toUserId,
            @RequestParam long amountCents) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        walletService.transfer(username, toUserId, amountCents);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        List<Transaction> transactions = walletService.getDepositTransactions(username);
        return ResponseEntity.ok(transactions);
    }
}
