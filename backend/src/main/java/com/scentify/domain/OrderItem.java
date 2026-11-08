package main.java.com.scentify.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "order_item_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  @Column(name = "product_name", nullable = false)
  private String productName;

  @Column(nullable = false)
  private int quantity;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
  private BigDecimal unitPrice;

  protected OrderItem() {
  }

  public OrderItem(Order order, String productName, int quantity, BigDecimal unitPrice) {
    this.order = order;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  public Long getId() { return id; }
  public Order getOrder() { return order; }
  public String getProductName() { return productName; }
  public int getQuantity() { return quantity; }
  public BigDecimal getUnitPrice() { return unitPrice; }
}