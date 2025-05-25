package com.example.sep_drive_backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sep_drive_backend.repository.WalletRepository;
import com.example.sep_drive_backend.repository.TransactionRepository;
import com.example.sep_drive_backend.models.Wallet;
import com.example.sep_drive_backend.models.Transaction;
import com.example.sep_drive_backend.constants.TransactionType;

@Service
public class WalletService {

    private final WalletRepository walletRepo;
    private final TransactionRepository transactionRepo;

    public WalletService(WalletRepository walletRepo,
                         TransactionRepository transactionRepo) {
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
    }

    public long getBalance(Long userId) {
        return walletRepo.findByUserId(userId)
                .map(Wallet::getBalanceCents)
                .orElse(0L);
    }

    @Transactional
    public void deposit(Long userId, long amountCents) {
    }

    @Transactional
    public void withdraw(Long userId, long amountCents) {
    }
}
