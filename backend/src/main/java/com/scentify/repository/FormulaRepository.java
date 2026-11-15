package com.scentify.repository;

import com.scentify.domain.Formula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface FormulaRepository extends JpaRepository<Formula, Long> {

    @EntityGraph(attributePaths = {"details", "details.ingredient"})
    Optional<Formula> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"details", "details.ingredient"})
    List<Formula> findByUserIdOrderByCreatedAtDesc(String userId);

    @EntityGraph(attributePaths = {"details", "details.ingredient", "recommendedBottle"})
    List<Formula> findByUserIdIsNullOrderByCreatedAtDesc();
}