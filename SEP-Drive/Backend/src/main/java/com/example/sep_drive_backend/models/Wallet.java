package com.example.sep_drive_backend.models;

import jakarta.persistence.*;

@Entity
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private long balanceCents = 0L;

    public Wallet() {
        // Default constructor for JPA
    }

    public Long getId() {
        return id;
    }

    public long getBalanceCents() {
        return balanceCents;
    }

    public void setBalanceCents(long balanceCents) {
        this.balanceCents = balanceCents;
    }
}
