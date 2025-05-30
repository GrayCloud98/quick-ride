package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sep_drive_backend.repository.WalletRepository;
import com.example.sep_drive_backend.repository.TransactionRepository;
import com.example.sep_drive_backend.models.Wallet;
import com.example.sep_drive_backend.models.User;
import com.example.sep_drive_backend.models.Transaction;
import com.example.sep_drive_backend.constants.TransactionType;

@Service
public class WalletService {

    private final WalletRepository walletRepo;
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;

    public WalletService(WalletRepository walletRepo,
                         TransactionRepository transactionRepo, UserRepository userRepo) {
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
    }

    private Wallet getWalletForUser(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        return user != null ? user.getWallet() : null;
    }

    public long getBalance(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null || user.getWallet() == null) return 0L;
        return user.getWallet().getBalanceCents();
    }

    @Transactional
    public void deposit(Long userId, long amountCents) {
    }

    @Transactional
    public void withdraw(Long userId, long amountCents) {
    }
}
