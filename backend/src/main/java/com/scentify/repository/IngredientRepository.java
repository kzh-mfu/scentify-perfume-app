/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Backend tasks: ingredient persistence and search queries.
 */
package com.scentify.repository;

import com.scentify.domain.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
  List<Ingredient> findByNameContainingIgnoreCaseOrScentFamilyContainingIgnoreCaseOrderByNameAsc(
      String name, String scentFamily);
}
