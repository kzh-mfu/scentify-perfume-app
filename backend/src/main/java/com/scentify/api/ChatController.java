/*
 * Team member: Saw Keh Blu (6831503087)
 * Backend tasks: customer messages, staff replies, and chat relationships.
 */
package com.scentify.api;

import com.scentify.domain.ChatMessage;
import com.scentify.domain.Profile;
import com.scentify.repository.ChatMessageRepository;
import com.scentify.repository.ProfileRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@org.springframework.context.annotation.Profile("!local")
public class ChatController {
  private final ChatMessageRepository messages;
  private final ProfileRepository profiles;
  private final CurrentUser currentUser;

  public ChatController(
      ChatMessageRepository messages,
      ProfileRepository profiles,
      CurrentUser currentUser
  ) {
    this.messages = messages;
    this.profiles = profiles;
    this.currentUser = currentUser;
  }

  @GetMapping("/messages")
  public List<MessageResponse> customerMessages(Authentication authentication) {
    return messages.findByUserIdOrderByCreatedAtAsc(currentUser.id(authentication)).stream()
        .map(this::response).toList();
  }

  @PostMapping("/messages")
  @ResponseStatus(HttpStatus.CREATED)
  public MessageResponse sendCustomerMessage(
      Authentication authentication,
      @Valid @RequestBody MessageRequest request
  ) {
    String userId = currentUser.id(authentication);
    ensureProfile(userId, authentication.getName());
    return response(messages.save(new ChatMessage(userId, userId, "customer", request.message())));
  }

  @GetMapping("/admin/messages")
  public List<MessageResponse> adminMessages(
      Authentication authentication,
      @RequestParam(required = false) String userId
  ) {
    currentUser.requireStaff(authentication);
    List<ChatMessage> result = userId == null
        ? messages.findAllByOrderByCreatedAtAsc()
        : messages.findByUserIdOrderByCreatedAtAsc(userId);
    return result.stream().map(this::response).toList();
  }

  @PostMapping("/admin/messages")
  @ResponseStatus(HttpStatus.CREATED)
  public MessageResponse sendAdminMessage(
      Authentication authentication,
      @Valid @RequestBody AdminMessageRequest request
  ) {
    currentUser.requireStaff(authentication);
    String senderId = currentUser.id(authentication);
    ensureProfile(senderId, authentication.getName());
    ensureProfile(request.userId(), request.userId());
    return response(messages.save(new ChatMessage(request.userId(), senderId, "admin", request.message())));
  }

  private void ensureProfile(String id, String displayName) {
    profiles.findById(id).orElseGet(() -> profiles.save(new Profile(id, displayName, "{}")));
  }

  private MessageResponse response(ChatMessage message) {
    String customerName = profiles.findById(message.getUserId())
        .map(Profile::getDisplayName)
        .orElse("Customer " + message.getUserId().substring(0, Math.min(8, message.getUserId().length())));
    return new MessageResponse(message.getId(), message.getUserId(), message.getSenderId(),
        message.getSenderRole(), message.getMessage(), message.getCreatedAt(), customerName);
  }

  public record MessageRequest(@NotBlank String message) {
  }

  public record AdminMessageRequest(@NotBlank String userId, @NotBlank String message) {
  }

  public record MessageResponse(
      String id,
      String userId,
      String senderId,
      String senderRole,
      String message,
      OffsetDateTime createdAt,
      String customerName
  ) {
  }
}
