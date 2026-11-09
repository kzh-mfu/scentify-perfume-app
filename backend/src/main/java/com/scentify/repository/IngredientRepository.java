package com.scentify.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.scentify.domain.Ingredient;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
  List<Ingredient> findByNameContainingIgnoreCaseOrScentFamilyContainingIgnoreCaseOrderByNameAsc(
      String name, String scentFamily);
}
