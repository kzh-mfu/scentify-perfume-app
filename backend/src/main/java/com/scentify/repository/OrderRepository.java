package com.scentify.repository;

import com.scentify.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
  List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

  List<Order> findAllByOrderByCreatedAtDesc();
}
