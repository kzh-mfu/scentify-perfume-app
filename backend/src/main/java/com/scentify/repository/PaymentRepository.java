package com.scentify.repository;
import com.scentify.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findAllByOrderByCreatedAtDesc();
  Optional<Payment> findByOrderId(Long orderId);
}
