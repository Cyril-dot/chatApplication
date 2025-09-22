package com.ChatWebSocket20.chatAp50.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "Conversations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "conversation_id", updatable = false, nullable = false, unique = true)
    private Long conversationId;

    @Column(name = "conversation_name", nullable = false)
    private String conversationName = "Global Chat";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
