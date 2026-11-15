package com.scentify.repository;
import com.scentify.domain.Bottle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BottleRepository extends JpaRepository<Bottle, Long> {
  List<Bottle> findByAvailableTrueOrderBySizeAsc();
}
