package com.ChatWebSocket20.chatAp50.entity;

import com.ChatWebSocket20.chatAp50.entity.UserEntity;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "messages")
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    private UserEntity sender;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Instant createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getSender() { return sender; }
    public void setSender(UserEntity sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    // Helper to safely return sender's username
    public String getSenderName() {
        return sender != null ? sender.getUsername() : "unknown";
    }
}
