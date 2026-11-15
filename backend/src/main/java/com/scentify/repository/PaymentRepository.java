package com.scentify.repository;
import com.scentify.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findAllByOrderByCreatedAtDesc();
  Optional<Payment> findByOrderId(Long orderId);

  @Query("""
      select p.id as id,
             p.order.id as orderId,
             p.paymentMethod as paymentMethod,
             p.transactionReference as transactionReference,
             p.status as status,
             p.verifiedAt as verifiedAt,
             p.createdAt as createdAt
      from Payment p
      order by p.createdAt desc
      """)
  List<PaymentSummary> findAllSummaries();

  interface PaymentSummary {
    Long getId();
    Long getOrderId();
    String getPaymentMethod();
    String getTransactionReference();
    String getStatus();
    java.time.OffsetDateTime getVerifiedAt();
    java.time.OffsetDateTime getCreatedAt();
  }
}
