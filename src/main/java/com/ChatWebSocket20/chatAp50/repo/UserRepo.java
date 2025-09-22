package com.ChatWebSocket20.chatAp50.repo;

import com.ChatWebSocket20.chatAp50.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepo extends JpaRepository<UserEntity, UUID> {

    /**
     * Find a user by username
     */
    Optional<UserEntity> findByUsername(String username);
}
