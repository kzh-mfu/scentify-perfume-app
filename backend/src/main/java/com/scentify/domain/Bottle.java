package com.scentify.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bottles")
public class Bottle {
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)

  @Column(name = "bottle_id") 
  private Long id;

  @Column(nullable = false) 
  private Integer size;

  @Column(name = "bottle_type", nullable = false, length = 100) 
  private String bottleType;

  @Column(nullable = false, precision = 12, scale = 2) 
  private BigDecimal price;

  @Column(name = "is_available", nullable = false) 
  private boolean available = true;

  @Column(length = 1000) 
  private String description;

  @Column(name = "created_at", insertable = false, updatable = false) 
  private OffsetDateTime createdAt;

  protected Bottle() {}

  public Bottle(Integer size, String bottleType, BigDecimal price, boolean available, String description) {
    this.size=size; 
    this.bottleType=bottleType; 
    this.price=price; this.available=available; 
    this.description=description; 
    }

  public Long getId(){return id;} 
  public Integer getSize(){return size;} 
  public void setSize(Integer v){size=v;}
  public String getBottleType(){return bottleType;} 
  public void setBottleType(String v){bottleType=v;}
  public BigDecimal getPrice(){return price;} 
  public void setPrice(BigDecimal v){price=v;}
  public boolean isAvailable(){return available;} 
  public void setAvailable(boolean v){available=v;}
  public String getDescription(){return description;} 
  public void setDescription(String v){description=v;}
  public OffsetDateTime getCreatedAt(){return createdAt;}
}
