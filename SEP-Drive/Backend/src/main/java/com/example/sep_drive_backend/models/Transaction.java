package com.example.sep_drive_backend.models;

import jakarta.persistence.*;
import java.time.Instant;
import com.example.sep_drive_backend.constants.TransactionType;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private long amountCents;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Transaction() {
        // Default constructor for JPA
    }

    public Transaction(Wallet wallet, TransactionType type, long amountCents) {
        this.wallet = wallet;
        this.type = type;
        this.amountCents = amountCents;
    }

    public Long getId() {
        return id;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public TransactionType getType() {
        return type;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
