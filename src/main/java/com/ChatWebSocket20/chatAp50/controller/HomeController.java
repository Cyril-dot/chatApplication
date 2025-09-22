package com.ChatWebSocket20.chatAp50.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    // this is a placeholder controller class for the home endpoint
    // it can be expanded in the future to handle HTTP requests if needed

    @GetMapping("/")
    public String index() {
        return "redirect:/index.html"; // serve static index explicitly
    }

}
