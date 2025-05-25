package com.example.sep_drive_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.sep_drive_backend.services.WalletService;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance")
    public ResponseEntity<Long> getBalance(@RequestHeader("X-User-Id") Long userId) {
        long balance = walletService.getBalance(userId);
        return ResponseEntity.ok(balance);
    }

    @PostMapping("/deposit")
    public ResponseEntity<Void> deposit(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam long amountCents) {
        walletService.deposit(userId, amountCents);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam long amountCents) {
        walletService.withdraw(userId, amountCents);
        return ResponseEntity.ok().build();
    }
}
