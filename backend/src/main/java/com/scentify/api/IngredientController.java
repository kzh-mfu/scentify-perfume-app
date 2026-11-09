/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Backend tasks: ingredient listing/searching, creation, updating, and deletion.
 */

package com.scentify.api;

import com.scentify.domain.Ingredient;
import com.scentify.repository.IngredientRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@org.springframework.context.annotation.Profile("!local")
public class IngredientController {
  private final IngredientRepository ingredients;
  private final CurrentUser currentUser;

  public IngredientController(IngredientRepository ingredients, CurrentUser currentUser) {
    this.ingredients = ingredients;
    this.currentUser = currentUser;
  }

  @GetMapping
  public List<IngredientResponse> list(Authentication authentication, @RequestParam(defaultValue = "") String search) {
    List<Ingredient> result = search.isBlank()
        ? ingredients.findAll()
        : ingredients.findByNameContainingIgnoreCaseOrScentFamilyContainingIgnoreCaseOrderByNameAsc(search, search);
    return result.stream().map(this::response).toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public IngredientResponse create(Authentication authentication, @Valid @RequestBody IngredientRequest request) {
    currentUser.requireStaff(authentication);
    return response(ingredients.save(new Ingredient(request.name(), request.scentFamily(),
        request.description(), request.available())));
  }

  @PutMapping("/{id}")
  public IngredientResponse update(Authentication authentication, @PathVariable Long id,
                                   @Valid @RequestBody IngredientRequest request) {
    currentUser.requireStaff(authentication);
    Ingredient ingredient = ingredients.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Ingredient not found."));
    ingredient.setName(request.name());
    ingredient.setScentFamily(request.scentFamily());
    ingredient.setDescription(request.description());
    ingredient.setAvailable(request.available());
    return response(ingredients.save(ingredient));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Authentication authentication, @PathVariable Long id) {
    currentUser.requireStaff(authentication);
    if (!ingredients.existsById(id)) {
      throw new IllegalArgumentException("Ingredient not found.");
    }
    ingredients.deleteById(id);
  }

  private IngredientResponse response(Ingredient ingredient) {
    return new IngredientResponse(ingredient.getId(), ingredient.getName(), ingredient.getScentFamily(),
        ingredient.getDescription(), ingredient.isAvailable());
  }

  public record IngredientRequest(
      @NotBlank String name,
      @NotBlank String scentFamily,
      @NotBlank String description,
      boolean available
  ) {}

  public record IngredientResponse(Long id, String name, String scentFamily, String description, boolean available) {}
}
