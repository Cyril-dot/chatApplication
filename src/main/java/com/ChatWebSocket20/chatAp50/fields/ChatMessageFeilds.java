package com.ChatWebSocket20.chatAp50.fields;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageFeilds {

    public enum Type {
        MESSAGE
    }

    private Type type;
    private String senderName;
    private String content;
}
