/*
 * Team member: Saw Keh Blu (6831503087)
 * Entity tasks: creating/listing customer messages and managing staff replies.
 */
package com.scentify.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "studio_chat_messages")
public class ChatMessage {
  @Id
  private String id;

  @Column(name = "user_id", nullable = false)
  private String userId;

  @Column(name = "sender_id", nullable = false)
  private String senderId;

  @Column(name = "sender_role", nullable = false)
  private String senderRole;

  @Column(nullable = false)
  private String message;

  @Column(name = "attachment_url", columnDefinition = "text")
  private String attachmentUrl;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  protected ChatMessage() {
  }

  public ChatMessage(String userId, String senderId, String senderRole, String message) {
    this(userId, senderId, senderRole, message, null);
  }

  public ChatMessage(String userId, String senderId, String senderRole, String message, String attachmentUrl) {
    this.id = java.util.UUID.randomUUID().toString();
    this.userId = userId;
    this.senderId = senderId;
    this.senderRole = senderRole;
    this.message = message;
    this.attachmentUrl = attachmentUrl;
    this.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public String getId() {
    return id;
  }

  public String getUserId() {
    return userId;
  }

  public String getSenderId() {
    return senderId;
  }

  public String getSenderRole() {
    return senderRole;
  }

  public String getMessage() {
    return message;
  }

  public String getAttachmentUrl() {
    return attachmentUrl;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }
}
