package com.scentify.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "shippings")
public class Shipping {
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)

  @Column(name = "shipping_id") 
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)

  @JoinColumn(name = "order_id", nullable = false, unique = true) 
  private Order order;

  @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2) 
  private BigDecimal shippingFee;

  @Column(name = "tracking_number", length = 150) 
  private String trackingNumber;

  @Column(name = "courier_name", length = 100)
  private String courierName;

  @Column(name = "shipping_address", nullable = false, columnDefinition = "text") 
  private String shippingAddress;

  @Column(name = "shipping_status", nullable = false, length = 30) 
  private String shippingStatus = "pending";

  @Column(name = "shipped_at") 
  private OffsetDateTime shippedAt;

  @Column(name = "delivered_at")
  private OffsetDateTime deliveredAt;

  protected Shipping() {}
  public Shipping(Order order,BigDecimal fee,String address){
    this.order=order;
    this.shippingFee=fee;
    this.shippingAddress=address;
    }
  public Long getId(){return id;} 
  public Order getOrder(){return order;} 
  public BigDecimal getShippingFee(){return shippingFee;}
  public String getTrackingNumber(){return trackingNumber;} 
  public void setTrackingNumber(String v){trackingNumber=v;}
  public String getCourierName(){return courierName;} 
  public void setCourierName(String v){courierName=v;}
  public String getShippingAddress(){return shippingAddress;} 
  public void setShippingAddress(String v){shippingAddress=v;}
  public String getShippingStatus(){return shippingStatus;} 
  public void setShippingStatus(String v){shippingStatus=v;}
  public OffsetDateTime getShippedAt(){return shippedAt;} 
  public void setShippedAt(OffsetDateTime v){shippedAt=v;}
  public OffsetDateTime getDeliveredAt(){return deliveredAt;} 
  public void setDeliveredAt(OffsetDateTime v){deliveredAt=v;}
}
