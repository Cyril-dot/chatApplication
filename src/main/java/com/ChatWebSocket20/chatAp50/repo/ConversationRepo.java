package com.ChatWebSocket20.chatAp50.repo;

import com.ChatWebSocket20.chatAp50.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConversationRepo extends JpaRepository<ConversationEntity, UUID> {
}
