package com.ChatWebSocket20.chatAp50.controller;

import com.ChatWebSocket20.chatAp50.entity.MessageEntity;
import com.ChatWebSocket20.chatAp50.repo.MessageRepo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class MessageController {

    private final MessageRepo messageRepo;

    public MessageController(MessageRepo messageRepo) {
        this.messageRepo = messageRepo;
    }

    @GetMapping("/messages")
    public List<Map<String, Object>> getMessages() {
        return messageRepo.findAllByOrderByCreatedAtAsc().stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId()); // updated from getMessageId() to getId()
                    map.put("senderName", m.getSender() != null ? m.getSender().getUsername() : "unknown");
                    map.put("content", m.getContent());
                    map.put("createdAt", m.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }


}
