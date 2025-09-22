package com.ChatWebSocket20.chatAp50.controller;

import com.ChatWebSocket20.chatAp50.entity.MessageEntity;
import com.ChatWebSocket20.chatAp50.fields.ChatMessageFeilds;
import com.ChatWebSocket20.chatAp50.handler.ChatWebSocketHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final ChatWebSocketHandler chatService;

    public ChatController(ChatWebSocketHandler chatService) {
        this.chatService = chatService;
    }

    // WebSocket message endpoint
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageFeilds message, SimpMessageHeaderAccessor headerAccessor) {
        if (message.getType() == ChatMessageFeilds.Type.MESSAGE) {
            MessageEntity saved = chatService.saveMessage(
                    message.getSenderName(),
                    message.getContent()
            );
            chatService.broadcastMessage(message, saved);
        }
    }

    // REST endpoint for fetching last 50 messages
    @GetMapping("/api/chat/messages")
    public List<Map<String, Object>> getMessages() {
        try {
            return chatService.getLastMessages(50).stream()
                    .map(m -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("senderName", m.getSenderName());
                        map.put("content", m.getContent());
                        map.put("createdAt", m.getCreatedAt() != null
                                ? m.getCreatedAt().toString()
                                : java.time.Instant.now().toString()); // safe string
                        return map;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace(); // log exact cause
            throw new RuntimeException("Failed to fetch chat messages", e);
        }
    }
}
