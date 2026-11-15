/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Backend tasks: ingredient persistence and search queries.
 */
package com.scentify.repository;

import com.scentify.domain.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
  List<Ingredient> findByNameContainingIgnoreCaseOrScentFamilyContainingIgnoreCaseOrderByNameAsc(
      String name, String scentFamily);

  @Modifying
  @Query("""
      update Ingredient ingredient
      set ingredient.stockMl = ingredient.stockMl - :amount
      where ingredient.id = :ingredientId
        and ingredient.available = true
        and ingredient.stockMl >= :amount
      """)
  int deductStock(@Param("ingredientId") Long ingredientId, @Param("amount") BigDecimal amount);

  @Modifying
  @Query("""
      update Ingredient ingredient
      set ingredient.stockMl = ingredient.stockMl + :amount
      where ingredient.id = :ingredientId
      """)
  int restoreStock(@Param("ingredientId") Long ingredientId, @Param("amount") BigDecimal amount);
}
