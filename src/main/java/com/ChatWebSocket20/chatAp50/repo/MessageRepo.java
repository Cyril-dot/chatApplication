package com.ChatWebSocket20.chatAp50.repo;

import com.ChatWebSocket20.chatAp50.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<MessageEntity, Long> {

    /**
     * Fetch the latest messages ordered by creation time descending.
     * Pageable allows fetching only the latest N messages.
     */
    @Query("SELECT m FROM MessageEntity m ORDER BY m.createdAt DESC")
    List<MessageEntity> findLatestMessages(Pageable pageable);

    /**
     * Optional helper to fetch all messages in ascending order (for history)
     */
    List<MessageEntity> findAllByOrderByCreatedAtAsc();
}
