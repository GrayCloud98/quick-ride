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

import java.util.List;
import java.util.stream.Collectors;

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

    private Wallet getWalletForUsername(String username) {
        return userRepo.findByUsername(username)
                .map(User::getWallet)
                .orElse(null);
    }

    public long getBalance(String username) {
        return userRepo.findByUsername(username)
                .map(User::getWallet)
                .map(Wallet::getBalanceCents)
                .orElse(0L);
    }

    @Transactional
    public void deposit(String username, long amountCents) {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Deposit amount must be greater than zero.");
        }
        if (amountCents > 1_000_000) {
            throw new IllegalArgumentException("Maximum deposit is 10,000 EUR.");
        }

        Wallet wallet = getWalletForUsername(username);
        if (wallet == null) {
            throw new IllegalArgumentException("Wallet not found for user: " + username);
        }
        wallet.setBalanceCents(wallet.getBalanceCents() + amountCents);
        walletRepo.save(wallet);

        Transaction depositTransaction = new Transaction(
                wallet,
                TransactionType.DEPOSIT,
                amountCents
        );
        transactionRepo.save(depositTransaction);
    }

    @Transactional
    public void transfer(String fromUsername, long toUserId, long amountCents) {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero.");
        }

        Wallet fromWallet = getWalletForUsername(fromUsername);
        Wallet toWallet = getWalletForUser(toUserId);

        if (fromWallet == null) {
            throw new IllegalArgumentException("Sender wallet not found for user: " + fromUsername);
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

    private Wallet getWalletForUser(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        return user != null ? user.getWallet() : null;
    }
    public List<Transaction> getDepositTransactions(String username) {
        Wallet wallet = getWalletForUsername(username);
        if (wallet == null) {
            throw new IllegalArgumentException("Wallet not found for user: " + username);
        }

        return transactionRepo.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .filter(transaction -> transaction.getType() == TransactionType.DEPOSIT)
                .collect(Collectors.toList());
    }
}
