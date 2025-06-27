package com.example.sep_drive_backend.repository;

import com.example.sep_drive_backend.constants.TransactionType;
import com.example.sep_drive_backend.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
    List<Transaction> findByWalletIdAndTypeAndCreatedAtBetween(
            Long walletId,
            TransactionType type,
            Instant start,
            Instant end
    );

}
