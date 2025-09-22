package com.ChatWebSocket20.chatAp50.handler;

import com.ChatWebSocket20.chatAp50.entity.MessageEntity;
import com.ChatWebSocket20.chatAp50.entity.UserEntity;
import com.ChatWebSocket20.chatAp50.fields.ChatMessageFeilds;
import com.ChatWebSocket20.chatAp50.repo.MessageRepo;
import com.ChatWebSocket20.chatAp50.repo.UserRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class ChatWebSocketHandler {

    private final MessageRepo messageRepo;
    private final UserRepo userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketHandler(MessageRepo messageRepo,
                                UserRepo userRepo,
                                SimpMessagingTemplate messagingTemplate) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.messagingTemplate = messagingTemplate;
    }

    public MessageEntity saveMessage(String senderUsername, String content) {
        var sender = userRepo.findByUsername(senderUsername)
                .orElseGet(() -> userRepo.save(new UserEntity(senderUsername, senderUsername)));

        MessageEntity message = new MessageEntity();
        message.setSender(sender);
        message.setContent(content);
        message.setCreatedAt(Instant.now());

        return messageRepo.save(message);
    }

    public void broadcastMessage(ChatMessageFeilds dto, MessageEntity savedMessage) {
        if (savedMessage == null || dto == null) return;
        messagingTemplate.convertAndSend("/topic/global", Map.of(
                "senderName", savedMessage.getSender().getUsername(),
                "content", savedMessage.getContent(),
                "createdAt", savedMessage.getCreatedAt()
        ));
    }

    // New method to fetch last N messages
    public List<MessageEntity> getLastMessages(int n) {
        var pageable = PageRequest.of(0, n);
        var messages = messageRepo.findLatestMessages(pageable);
        // reverse to show oldest first
        Collections.reverse(messages);
        return messages;
    }
}
