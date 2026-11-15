/* Order line; formula and bottle are nullable only to retain compatibility with old orders. */
package com.scentify.domain;

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

  @ManyToOne(fetch = FetchType.LAZY)

  @JoinColumn(name = "formula_id") 
  private Formula formula;

  @ManyToOne(fetch = FetchType.LAZY)

  @JoinColumn(name = "bottle_id") 
  private Bottle bottle;

  @Column(nullable = false) 
  private int quantity;

  @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) 
  private BigDecimal unitPrice;

  protected OrderItem() {}

  public OrderItem(Order order,String productName,int quantity,BigDecimal unitPrice){
      this.order=order;
      this.productName=productName;
      this.quantity=quantity;
      this.unitPrice=unitPrice;
    }

  public OrderItem(Order order,String productName,Formula formula,Bottle bottle,int quantity,BigDecimal unitPrice){
    this(order,productName,quantity,unitPrice);
    this.formula=formula;this.bottle=bottle;
  }

  public Long getId(){return id;} 
  public Order getOrder(){return order;} 
  public String getProductName(){return productName;}
  public Formula getFormula(){return formula;} 
  public Bottle getBottle(){return bottle;}
  public int getQuantity(){return quantity;} 
  public BigDecimal getUnitPrice(){return unitPrice;}
}
