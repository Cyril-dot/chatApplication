package com.ChatWebSocket20.chatAp50.repo;

import com.ChatWebSocket20.chatAp50.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<UserEntity, Long> {

    /**
     * Find a user by username
     */
    Optional<UserEntity> findByUsername(String username);
}
