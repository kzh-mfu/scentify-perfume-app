package com.scentify.api;

import com.scentify.domain.*;
import com.scentify.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/formulas")
@org.springframework.context.annotation.Profile("!local")

public class FormulaController {
  private final FormulaRepository formulas; 
  private final ProfileRepository profiles;
  private final IngredientRepository ingredients; 
  private final BottleRepository bottles;
  private final CurrentUser currentUser;
  
  public FormulaController(
    FormulaRepository formulas,
    IngredientRepository ingredients,
    ProfileRepository profiles,
    BottleRepository bottles,
    CurrentUser currentUser
      ) {
    this.formulas = formulas;
    this.ingredients = ingredients;
    this.profiles = profiles;
    this.bottles = bottles;
    this.currentUser = currentUser;
    }


@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public FormulaResponse create(
    Authentication auth,
    @Valid @RequestBody FormulaRequest r
) {
    String uid = currentUser.id(auth);

    // Ensure the user has a profile before creating a formula
    profiles.findById(uid).orElseGet(() ->
        profiles.save(new Profile(uid, "Studio Member", "{}"))
    );

    Formula f = new Formula(
        uid,
        r.formulaName(),
        r.description(),
        true
    );

    addDetails(f, r.details());
    return response(formulas.save(f));
}


@GetMapping
public List<FormulaResponse> list(Authentication auth) {
    String uid = currentUser.id(auth);

    return formulas.findByUserIdOrderByCreatedAtDesc(uid)
        .stream()
        .map(this::response)
        .toList();
}

  @GetMapping("/catalog")
  public List<FormulaResponse> listCatalog() {
    return formulas.findByUserIdIsNullOrderByCreatedAtDesc()
        .stream()
        .filter(Formula::isActive)
        .map(this::response)
        .toList();
  }

  @GetMapping("/catalog/manage")
  public List<FormulaResponse> listCatalogForStaff(Authentication auth) {
    currentUser.requireStaff(auth);
    return formulas.findByUserIdIsNullOrderByCreatedAtDesc()
        .stream()
        .map(this::response)
        .toList();
  }

  @PostMapping("/catalog")
  @ResponseStatus(HttpStatus.CREATED)
  public FormulaResponse createCatalogFormula(
      Authentication auth,
      @Valid @RequestBody CatalogFormulaRequest request
  ) {
    currentUser.requireStaff(auth);
    Formula formula = new Formula(null, request.formulaName(), request.description(), request.active());
    formula.setRecommendedBottle(findBottle(request.recommendedBottleId()));
    addDetails(formula, request.details());
    return response(formulas.save(formula));
  }

  @PutMapping("/catalog/{id}")
  @Transactional
  public FormulaResponse updateCatalogFormula(
      Authentication auth,
      @PathVariable Long id,
      @Valid @RequestBody CatalogFormulaRequest request
  ) {
    currentUser.requireStaff(auth);
    Formula formula = findCatalogFormula(id);
    formula.setFormulaName(request.formulaName());
    formula.setDescription(request.description());
    formula.setActive(request.active());
    formula.setRecommendedBottle(findBottle(request.recommendedBottleId()));
    formula.clearDetails();
    addDetails(formula, request.details());
    return response(formulas.save(formula));
  }

  @DeleteMapping("/catalog/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void deactivateCatalogFormula(Authentication auth, @PathVariable Long id) {
    currentUser.requireStaff(auth);
    Formula formula = findCatalogFormula(id);
    formula.setActive(false);
    formulas.save(formula);
  }

  private Formula findCatalogFormula(Long id) {
    Formula formula = formulas.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formula not found."));
    if (formula.getUserId() != null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Master formula not found.");
    }
    return formula;
  }

  private Bottle findBottle(Long bottleId) {
    if (bottleId == null) return null;
    return bottles.findById(bottleId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bottle not found."));
  }

  private void addDetails(Formula formula, List<FormulaDetailRequest> details) {
    for (FormulaDetailRequest detail : details) {
      Ingredient ingredient = ingredients.findById(detail.ingredientId())
          .orElseThrow(() -> new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Ingredient not found: " + detail.ingredientId()
          ));
      if (!ingredient.isAvailable()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Ingredient is unavailable: " + ingredient.getName()
        );
      }
      formula.addDetail(new FormulaDetail(
          ingredient, detail.noteType().toLowerCase(), detail.percentage()
      ));
    }
  }

  private FormulaResponse response(Formula f){
    return new FormulaResponse(
        f.getId(), f.getUserId(), f.getFormulaName(), f.getDescription(), f.isActive(),
        f.getCreatedAt(), f.getRecommendedBottle() == null ? null : f.getRecommendedBottle().getId(),
        f.getDetails().stream().map(d -> new FormulaDetailResponse(
            d.getId(), d.getIngredient().getId(), d.getIngredient().getName(),
            d.getNoteType(), d.getPercentage()
        )).toList()
    );
  }
  
  public record FormulaRequest(
      @NotBlank String formulaName,
      String description,
      @NotNull List<@Valid FormulaDetailRequest> details
  ) {}
  public record CatalogFormulaRequest(
      @NotBlank String formulaName,
      String description,
      boolean active,
      Long recommendedBottleId,
      @NotNull List<@Valid FormulaDetailRequest> details
  ) {}
  public record FormulaDetailRequest(
      @NotNull Long ingredientId,
      @NotBlank @Pattern(regexp = "(?i)top|heart|base") String noteType,
      BigDecimal percentage
  ) {}
  public record FormulaResponse(
      Long formulaId,
      String userId,
      String formulaName,
      String description,
      boolean active,
      java.time.OffsetDateTime createdAt,
      Long recommendedBottleId,
      List<FormulaDetailResponse> details
  ) {}
  public record FormulaDetailResponse(
      Long formulaDetailId,
      Long ingredientId,
      String ingredientName,
      String noteType,
      BigDecimal percentage
  ) {}
}
