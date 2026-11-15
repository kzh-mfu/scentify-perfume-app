package com.scentify.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments")
public class Payment {
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)

  @Column(name = "payment_id") 
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)

  @JoinColumn(name = "order_id", nullable = false, unique = true) 
  private Order order;

  @Column(name = "payment_method", nullable = false, length = 50) 
  private String paymentMethod;

  @Column(name = "qr_receipt_url", columnDefinition = "text") 
  private String receiptUrl;

  @Column(name = "transaction_reference", length = 150)
  private String transactionReference;

  @Column(nullable = false, length = 30)
  private String status = "pending";

  @Column(name = "verified_at") 
  private OffsetDateTime verifiedAt;

  @Column(name = "created_at", insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  protected Payment() {}

  public Payment(Order order,String paymentMethod,String receiptUrl,String transactionReference){
    this.order=order;
    this.paymentMethod=paymentMethod;
    this.receiptUrl=receiptUrl;
    this.transactionReference=transactionReference;
    }
    
  public Long getId(){return id;} 
  public Order getOrder(){return order;} 
  public String getPaymentMethod(){return paymentMethod;}
  public String getReceiptUrl(){return receiptUrl;} 
  public String getTransactionReference(){return transactionReference;}
  public String getStatus(){return status;} 
  public void setStatus(String v){status=v;} public OffsetDateTime getVerifiedAt(){return verifiedAt;}
  public void setVerifiedAt(OffsetDateTime v){verifiedAt=v;} 
  public OffsetDateTime getCreatedAt(){return createdAt;}
}
