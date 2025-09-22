package com.ChatWebSocket20.chatAp50.controller;

import com.ChatWebSocket20.chatAp50.entity.MessageEntity;
import com.ChatWebSocket20.chatAp50.entity.UserEntity;
import com.ChatWebSocket20.chatAp50.fields.ChatMessageFeilds;
import com.ChatWebSocket20.chatAp50.repo.MessageRepo;
import com.ChatWebSocket20.chatAp50.repo.UserRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final MessageRepo messageRepo;
    private final UserRepo userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageRepo messageRepo, UserRepo userRepo, SimpMessagingTemplate messagingTemplate) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.messagingTemplate = messagingTemplate;
    }

    // STOMP entrypoint: client sends to /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void receiveStompMessage(Incoming incoming) {
        String username = (incoming.getUsername() == null || incoming.getUsername().isBlank()) ? "Anonymous" : incoming.getUsername().trim();

        // find or create user (no password required)
        UserEntity user = userRepo.findByUsername(username)
                .orElseGet(() -> {
                    UserEntity u = new UserEntity();
                    u.setUsername(username);
                    u.setDisplayName(username);
                    // password can be null (you set column nullable)
                    return userRepo.save(u);
                });

        // create and persist message
        MessageEntity m = new MessageEntity();
        m.setSender(user);
        m.setContent(incoming.getContent());
        m.setCreatedAt(Instant.now());
        MessageEntity saved = messageRepo.save(m);

        // build outgoing DTO (shape client expects)
        ChatMessageOut out = new ChatMessageOut(
                saved.getId(),
                saved.getContent(),
                saved.getCreatedAt().toString(),
                user.getUsername(),
                user.getDisplayName()
        );

        // broadcast to subscribers on /topic/global
        messagingTemplate.convertAndSend("/topic/global", out);
    }

    // REST endpoint for fetching recent messages (used by client fetchHistory)
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessageOut>> getMessages(@RequestParam(value = "limit", defaultValue = "50") int limit) {
        if (limit <= 0) limit = 50;
        List<MessageEntity> rows = messageRepo.findLatestMessages(PageRequest.of(0, limit));
        List<ChatMessageOut> out = rows.stream()
                .map(m -> new ChatMessageOut(
                        m.getId(),
                        m.getContent(),
                        m.getCreatedAt().toString(),
                        m.getSenderName(),
                        m.getSender() != null ? m.getSender().getDisplayName() : null
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    // Incoming payload from client (matches index.js payload)
    public static class Incoming {
        private String content;
        private String username;
        private String displayName; // optional

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
    }

    // Outgoing DTO to client
    public static class ChatMessageOut {
        private Long id;
        private String content;
        private String createdAt;
        private String username;
        private String displayName;

        public ChatMessageOut(Long id, String content, String createdAt, String username, String displayName) {
            this.id = id;
            this.content = content;
            this.createdAt = createdAt;
            this.username = username;
            this.displayName = displayName;
        }

        public Long getId() { return id; }
        public String getContent() { return content; }
        public String getCreatedAt() { return createdAt; }
        public String getUsername() { return username; }
        public String getDisplayName() { return displayName; }
    }
}
