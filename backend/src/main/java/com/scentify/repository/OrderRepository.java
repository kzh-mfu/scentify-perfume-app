/*
 * Team member: Ei Thandar Kyaw (6831502020)
 * Backend tasks: order persistence, purchase history, and staff order queries.
 */
package com.scentify.repository;

import com.scentify.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
  boolean existsByOrderNumber(String orderNumber);

  List<Order> findByUserIdOrderByCreatedAtDesc(String userId);

  List<Order> findAllByOrderByCreatedAtDesc();

  @Query("""
      select o.id as id,
             o.orderNumber as orderNumber,
             o.userId as userId,
             o.customerName as customerName,
             o.customerEmail as customerEmail,
             o.customerPhone as customerPhone,
             o.shippingAddress as shippingAddress,
             o.total as total,
             o.status as status,
             o.paymentStatus as paymentStatus,
             o.verifiedAt as verifiedAt,
             o.items as items,
             o.createdAt as createdAt
      from Order o
      order by o.createdAt desc
      """)
  List<OrderSummary> findAllSummaries();

  @Query("""
      select o.id as id,
             o.orderNumber as orderNumber,
             o.userId as userId,
             o.customerName as customerName,
             o.customerEmail as customerEmail,
             o.customerPhone as customerPhone,
             o.shippingAddress as shippingAddress,
             o.total as total,
             o.status as status,
             o.paymentStatus as paymentStatus,
             o.verifiedAt as verifiedAt,
             o.items as items,
             o.createdAt as createdAt
      from Order o
      where o.userId = :userId
      order by o.createdAt desc
      """)
  List<OrderSummary> findSummariesByUserId(@Param("userId") String userId);

  interface OrderSummary {
    Long getId();
    String getOrderNumber();
    String getUserId();
    String getCustomerName();
    String getCustomerEmail();
    String getCustomerPhone();
    String getShippingAddress();
    java.math.BigDecimal getTotal();
    String getStatus();
    String getPaymentStatus();
    java.time.OffsetDateTime getVerifiedAt();
    String getItems();
    java.time.OffsetDateTime getCreatedAt();
  }
}
