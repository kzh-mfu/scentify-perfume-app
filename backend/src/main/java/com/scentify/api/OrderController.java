/*
 * Team member: Ei Thandar Kyaw (6831502020)
 * Backend tasks: order creation, purchase history, staff listing, and status updates.
 */
package com.scentify.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scentify.domain.Order;
import com.scentify.domain.Profile;
import com.scentify.repository.OrderRepository;
import com.scentify.repository.ProfileRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Iterator;

@RestController
@RequestMapping("/api/orders")
@org.springframework.context.annotation.Profile("!local")
public class OrderController {
  private final OrderRepository orders;
  private final ProfileRepository profiles;
  private final CurrentUser currentUser;
  private final ObjectMapper objectMapper;

  public OrderController(
      OrderRepository orders,
      ProfileRepository profiles,
      CurrentUser currentUser,
      ObjectMapper objectMapper
  ) {
    this.orders = orders;
    this.profiles = profiles;
    this.currentUser = currentUser;
    this.objectMapper = objectMapper;
  }

  @GetMapping
  public List<OrderResponse> list(Authentication authentication) {
    currentUser.requireStaff(authentication);
    return orders.findAllByOrderByCreatedAtDesc().stream().map(this::response).toList();
  }

  @GetMapping("/mine")
  public List<OrderResponse> mine(Authentication authentication) {
    return orders.findByUserIdOrderByCreatedAtDesc(currentUser.id(authentication)).stream()
        .map(this::response).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public OrderResponse create(Authentication authentication, @Valid @RequestBody CreateOrderRequest request) {
    var userId = currentUser.id(authentication);
    profiles.findById(userId).orElseGet(() ->
        profiles.save(new Profile(userId, request.customerName(), "{}")));

    Order order = new Order();
    order.setOrderNumber(request.orderNumber());
    order.setUserId(userId);
    order.setCustomerName(request.customerName());
    order.setCustomerEmail(request.customerEmail());
    order.setCustomerPhone(request.customerPhone());
    order.setShippingAddress(request.shippingAddress());
    order.setTotal(request.total());
    order.setStatus("pending");
    order.setPaymentStatus("pending");
    order.setPaymentSlipUrl(request.paymentSlipUrl());
    order.setItems(writeJson(request.items()));
    addOrderItems(order, request.items());
    return response(orders.save(order));
  }

  @PatchMapping("/{id}/status")
  public OrderResponse updateStatus(
      Authentication authentication,
      @PathVariable Long id,
      @Valid @RequestBody StatusRequest request
  ) {
    currentUser.requireStaff(authentication);
    Order order = orders.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found."));
    if (request.status() != null) {
      order.setStatus(request.status());
    }
    if (request.paymentStatus() != null) {
      order.setPaymentStatus(request.paymentStatus());
    }
    if ("processing".equals(request.status()) || "verified".equals(request.paymentStatus())) {
      order.setPaymentStatus("verified");
      order.setVerifiedAt(OffsetDateTime.now());
    }
    return response(orders.save(order));
  }

  private String writeJson(JsonNode value) {
    try {
      return objectMapper.writeValueAsString(value == null ? objectMapper.createArrayNode() : value);
    } catch (Exception exception) {
      throw new IllegalArgumentException("Order items must be valid JSON.", exception);
    }
  }

  private void addOrderItems(Order order, JsonNode items) {
    if (items == null || !items.isArray()) {
      return;
    }
    Iterator<JsonNode> iterator = items.elements();
    while (iterator.hasNext()) {
      JsonNode item = iterator.next();
      String name = item.path("name").asText(item.path("productName").asText("Custom fragrance"));
      int quantity = Math.max(1, item.path("quantity").asInt(1));
      BigDecimal unitPrice = item.path("price").isNumber()
          ? item.path("price").decimalValue()
          : item.path("unitPrice").decimalValue();
      order.addOrderItem(new com.scentify.domain.OrderItem(order, name, quantity, unitPrice));
    }
  }

  private OrderResponse response(Order order) {
    try {
      return new OrderResponse(order.getId(), order.getOrderNumber(), order.getUserId(),
          order.getCustomerName(), order.getCustomerEmail(), order.getCustomerPhone(),
          order.getShippingAddress(), order.getTotal(), order.getStatus(), order.getPaymentStatus(),
          order.getPaymentSlipUrl(), order.getVerifiedAt(), objectMapper.readTree(order.getItems()),
          order.getCreatedAt());
    } catch (Exception exception) {
      throw new IllegalStateException("Stored order items are invalid.", exception);
    }
  }

  public record CreateOrderRequest(
      @NotBlank String orderNumber,
      @NotBlank String customerName,
      @NotBlank String customerEmail,
      @NotBlank String customerPhone,
      @NotBlank String shippingAddress,
      @NotNull @DecimalMin("0.00") BigDecimal total,
      String paymentSlipUrl,
      JsonNode items
  ) {
  }

  public record StatusRequest(String status, String paymentStatus) {
  }

  public record OrderResponse(
      Long id,
      String orderNumber,
      String userId,
      String customerName,
      String customerEmail,
      String customerPhone,
      String shippingAddress,
      BigDecimal total,
      String status,
      String paymentStatus,
      String paymentSlipUrl,
      OffsetDateTime verifiedAt,
      JsonNode items,
      OffsetDateTime createdAt
  ) {
  }
}
