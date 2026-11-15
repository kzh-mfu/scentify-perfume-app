/*
 * Team member: Ei Thandar Kyaw (6831502020)
 * Backend tasks: order creation, purchase history, staff listing, and status updates.
 */
package com.scentify.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.scentify.domain.Bottle;
import com.scentify.domain.Formula;
import com.scentify.domain.FormulaDetail;
import com.scentify.domain.Order;
import com.scentify.domain.Profile;
import com.scentify.repository.BottleRepository;
import com.scentify.repository.FormulaRepository;
import com.scentify.repository.IngredientRepository;
import com.scentify.repository.OrderRepository;
import com.scentify.repository.ProfileRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@org.springframework.context.annotation.Profile("!local")
public class OrderController {
  private final OrderRepository orders;
  private final ProfileRepository profiles;
  private final CurrentUser currentUser;
  private final ObjectMapper objectMapper;
  private final BottleRepository bottles;
  private final FormulaRepository formulas;
  private final IngredientRepository ingredients;

  public OrderController(
      OrderRepository orders,
      ProfileRepository profiles,
      CurrentUser currentUser,
      ObjectMapper objectMapper,
      BottleRepository bottles,
      FormulaRepository formulas,
      IngredientRepository ingredients
  ) {
    this.orders = orders;
    this.profiles = profiles;
    this.currentUser = currentUser;
    this.objectMapper = objectMapper;
    this.bottles = bottles;
    this.formulas = formulas;
    this.ingredients = ingredients;
  }

  @GetMapping
  public List<OrderResponse> list(Authentication authentication) {
    currentUser.requireStaff(authentication);
    return orders.findAllSummaries().stream().map(this::response).toList();
  }

  @GetMapping("/mine")
  public List<OrderResponse> mine(Authentication authentication) {
    return orders.findSummariesByUserId(currentUser.id(authentication)).stream()
        .map(this::response).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public OrderResponse create(Authentication authentication, @Valid @RequestBody CreateOrderRequest request) {
    var userId = currentUser.id(authentication);
    profiles.findById(userId).orElseGet(() ->
        profiles.save(new Profile(userId, request.customerName(), "{}")));

    Order order = new Order();
    order.setOrderNumber("PENDING-" + UUID.randomUUID());
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
    addOrderItems(order, request.items(), userId, authentication);
    Order savedOrder = orders.save(order);
    savedOrder.setOrderNumber(String.valueOf(savedOrder.getId()));
    return response(orders.save(savedOrder));
  }

  @PatchMapping("/{id}/status")
  @Transactional
  public OrderResponse updateStatus(
      Authentication authentication,
      @PathVariable Long id,
      @Valid @RequestBody StatusRequest request
  ) {
    currentUser.requireStaff(authentication);
    Order order = orders.findByIdForUpdate(id)
        .orElseThrow(() -> new IllegalArgumentException("Order not found."));
    if (request.status() != null) {
      boolean currentlyCancelled = "cancelled".equals(order.getStatus());
      boolean willBeCancelled = "cancelled".equals(request.status());
      if (!currentlyCancelled && willBeCancelled) {
        restoreStock(order);
      } else if (currentlyCancelled && !willBeCancelled) {
        deductStockForReopenedOrder(order);
      }
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

  private void addOrderItems(Order order, JsonNode items, String userId, Authentication authentication) {
    if (items == null || !items.isArray()) {
      return;
    }
    Map<Long, BigDecimal> ingredientDeductions = new LinkedHashMap<>();
    Map<Long, String> ingredientNames = new LinkedHashMap<>();
    Iterator<JsonNode> iterator = items.elements();
    while (iterator.hasNext()) {
      JsonNode item = iterator.next();
      String name = item.path("name").asText(item.path("productName").asText("Custom fragrance"));
      int quantity = Math.max(1, item.path("quantity").asInt(1));
      BigDecimal unitPrice = item.path("price").isNumber()
          ? item.path("price").decimalValue()
          : item.path("unitPrice").decimalValue();
      Formula formula = null;
      Bottle bottle = null;
      if (item.hasNonNull("formulaId")) {
        formula = formulas.findWithDetailsById(item.path("formulaId").asLong())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formula not found."));
        if (!formula.isActive()) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formula is unavailable.");
        }
        if (formula.getUserId() != null && !userId.equals(formula.getUserId())) {
          currentUser.requireStaff(authentication);
        }
      }
      if (item.hasNonNull("bottleId")) {
        bottle = bottles.findById(item.path("bottleId").asLong())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bottle not found."));
        if (!bottle.isAvailable()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bottle is unavailable.");
      }
      if (formula != null && bottle != null && !formula.getDetails().isEmpty()) {
        BigDecimal perIngredient = BigDecimal.valueOf((long) bottle.getSize() * quantity)
            .divide(BigDecimal.valueOf(formula.getDetails().size()), 3, RoundingMode.HALF_UP);
        for (FormulaDetail detail : formula.getDetails()) {
          Long ingredientId = detail.getIngredient().getId();
          ingredientDeductions.merge(ingredientId, perIngredient, BigDecimal::add);
          ingredientNames.putIfAbsent(ingredientId, detail.getIngredient().getName());
        }
      }
      order.addOrderItem(new com.scentify.domain.OrderItem(order, name, formula, bottle, quantity, unitPrice));
    }
    for (Map.Entry<Long, BigDecimal> deduction : ingredientDeductions.entrySet()) {
      if (ingredients.deductStock(deduction.getKey(), deduction.getValue()) == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Insufficient stock for ingredient \"" + ingredientNames.get(deduction.getKey()) + "\"."
        );
      }
    }
    ArrayNode stockDeductions = objectMapper.createArrayNode();
    ingredientDeductions.forEach((ingredientId, amount) ->
        stockDeductions.add(objectMapper.createObjectNode()
            .put("ingredientId", ingredientId)
            .put("amountMl", amount)));
    order.setStockDeductions(writeJson(stockDeductions));
  }

  private void restoreStock(Order order) {
    if (order.isStockRestored()) return;
    for (StockDeduction deduction : readStockDeductions(order)) {
      if (ingredients.restoreStock(deduction.ingredientId(), deduction.amountMl()) == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Unable to restore stock for ingredient #" + deduction.ingredientId() + "."
        );
      }
    }
    order.setStockRestored(true);
  }

  private void deductStockForReopenedOrder(Order order) {
    if (!order.isStockRestored()) return;
    for (StockDeduction deduction : readStockDeductions(order)) {
      if (ingredients.deductStock(deduction.ingredientId(), deduction.amountMl()) == 0) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Insufficient stock to reinstate order for ingredient #" + deduction.ingredientId() + "."
        );
      }
    }
    order.setStockRestored(false);
  }

  private List<StockDeduction> readStockDeductions(Order order) {
    String serialized = order.getStockDeductions();
    if (serialized == null || serialized.isBlank()) return List.of();
    JsonNode deductions;
    try {
      deductions = objectMapper.readTree(serialized);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Stored stock deductions are invalid.", exception);
    }
    if (!deductions.isArray()) {
      throw new IllegalStateException("Stored stock deductions must be an array.");
    }

    List<StockDeduction> result = new ArrayList<>();
    for (JsonNode deduction : deductions) {
      JsonNode ingredientId = deduction.path("ingredientId");
      JsonNode amountMl = deduction.path("amountMl");
      if (!ingredientId.canConvertToLong() || ingredientId.asLong() <= 0
          || !amountMl.isNumber() || amountMl.decimalValue().signum() <= 0) {
        throw new IllegalStateException("Stored stock deduction contains invalid values.");
      }
      result.add(new StockDeduction(ingredientId.asLong(), amountMl.decimalValue()));
    }
    return result;
  }

  private OrderResponse response(Order order) {
    try {
      return new OrderResponse(order.getId(), order.getOrderNumber(), order.getUserId(),
          order.getCustomerName(), order.getCustomerEmail(), order.getCustomerPhone(),
          order.getShippingAddress(), order.getTotal(), order.getStatus(), order.getPaymentStatus(),
          null, order.getVerifiedAt(), objectMapper.readTree(order.getItems()),
          order.getCreatedAt());
    } catch (Exception exception) {
      throw new IllegalStateException("Stored order items are invalid.", exception);
    }
  }

  private OrderResponse response(OrderRepository.OrderSummary order) {
    try {
      return new OrderResponse(order.getId(), order.getOrderNumber(), order.getUserId(),
          order.getCustomerName(), order.getCustomerEmail(), order.getCustomerPhone(),
          order.getShippingAddress(), order.getTotal(), order.getStatus(), order.getPaymentStatus(),
          null, order.getVerifiedAt(), objectMapper.readTree(order.getItems()), order.getCreatedAt());
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

  private record StockDeduction(Long ingredientId, BigDecimal amountMl) {
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
