package com.scentify.api;

import com.scentify.domain.*;
import com.scentify.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/formulas")
@org.springframework.context.annotation.Profile("!local")

public class FormulaController {
  private final FormulaRepository formulas; 
  private final ProfileRepository profiles;
  private final IngredientRepository ingredients; 
  private final CurrentUser currentUser;
  
  public FormulaController(
    FormulaRepository formulas,
    IngredientRepository ingredients,
    ProfileRepository profiles,
    CurrentUser currentUser
      ) {
    this.formulas = formulas;
    this.ingredients = ingredients;
    this.profiles = profiles;
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

    for (FormulaDetailRequest d : r.details()) {
        Ingredient i = ingredients.findById(d.ingredientId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Ingredient not found: " + d.ingredientId()
            ));

        if (!i.isAvailable()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Ingredient is unavailable: " + i.getName()
            );
        }

        f.addDetail(new FormulaDetail(
            i,
            d.noteType().toLowerCase(),
            d.percentage()
        ));
    }

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

  private FormulaResponse response(Formula f){
    return new FormulaResponse(f.getId(),f.getUserId(),f.getFormulaName(),f.getDescription(),f.isActive(),f.getCreatedAt(),f.getDetails().stream().map(d->new FormulaDetailResponse(d.getId(),d.getIngredient().getId(),d.getIngredient().getName(),d.getNoteType(),d.getPercentage())).toList());}
  
  public record FormulaRequest(@NotBlank String formulaName,String description,@NotNull List<@Valid FormulaDetailRequest> details){}
  public record FormulaDetailRequest(@NotNull Long ingredientId,@NotBlank String noteType,BigDecimal percentage){}
  public record FormulaResponse(Long formulaId,String userId,String formulaName,String description,boolean active,java.time.OffsetDateTime createdAt,List<FormulaDetailResponse> details){}
  public record FormulaDetailResponse(Long formulaDetailId,Long ingredientId,String ingredientName,String noteType,BigDecimal percentage){}
}
