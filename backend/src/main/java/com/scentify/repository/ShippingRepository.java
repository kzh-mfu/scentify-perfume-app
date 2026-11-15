package com.scentify.repository;
import com.scentify.domain.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
  List<Shipping> findAllByOrderByIdDesc();
  Optional<Shipping> findByOrderId(Long orderId);
}
