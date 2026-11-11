/*
 * Team member: Saw Keh Blu (6831503087)
 * Backend tasks: chat persistence and customer/staff message queries.
 */
package com.scentify.repository;

import com.scentify.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
  List<ChatMessage> findByUserIdOrderByCreatedAtAsc(String userId);

  List<ChatMessage> findAllByOrderByCreatedAtAsc();
}
