package com.example.sep_drive_backend.services;

import com.example.sep_drive_backend.constants.TransactionType;
import com.example.sep_drive_backend.models.Transaction;
import com.example.sep_drive_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.sep_drive_backend.repository.WalletRepository;
import com.example.sep_drive_backend.repository.TransactionRepository;
import com.example.sep_drive_backend.models.Wallet;
import com.example.sep_drive_backend.models.User;

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
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Deposit amount must be greater than zero.");
        }
        if (amountCents > 1_000_000) {
            throw new IllegalArgumentException("Maximum deposit is 10,000 EUR.");
        }

        Wallet wallet = getWalletForUser(userId);
        if (wallet == null) {
            throw new IllegalArgumentException("Wallet not found for user: " + userId);
        }
        wallet.setBalanceCents(wallet.getBalanceCents() + amountCents);
        walletRepo.save(wallet);

        // Log the deposit as a transaction
        Transaction depositTransaction = new Transaction(
                wallet,
                TransactionType.DEPOSIT,
                amountCents
                );
        transactionRepo.save(depositTransaction);
    }

    @Transactional
    public void transfer(Long fromUserId, long toUserId, long amountCents) {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero.");
        }

        Wallet fromWallet = getWalletForUser(fromUserId);
        Wallet toWallet = getWalletForUser(toUserId);

        if (fromWallet == null) {
            throw new IllegalArgumentException("Sender wallet not found for user: " + fromUserId);
        }
        if (toWallet == null) {
            throw new IllegalArgumentException("Receiver wallet not found for user: " + toUserId);
        }
        if (fromWallet.getBalanceCents() < amountCents) {
            throw new IllegalArgumentException("Insufficient balance.");
        }

        fromWallet.setBalanceCents(fromWallet.getBalanceCents() - amountCents);
        toWallet.setBalanceCents(toWallet.getBalanceCents() + amountCents);
        walletRepo.save(fromWallet);
        walletRepo.save(toWallet);

        Transaction outTx = new Transaction(
                fromWallet,
                TransactionType.PAYMENT_OUT,
                -amountCents
                );
        transactionRepo.save(outTx);

        Transaction inTx = new Transaction(
                toWallet,
                TransactionType.PAYMENT_IN,
                amountCents
                );
        transactionRepo.save(inTx);
    }
}
