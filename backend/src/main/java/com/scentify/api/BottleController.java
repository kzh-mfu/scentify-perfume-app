package com.scentify.api;

import com.scentify.domain.Bottle;
import com.scentify.repository.BottleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bottles")
@org.springframework.context.annotation.Profile("!local")
public class BottleController {
  private final BottleRepository bottles; private final CurrentUser currentUser;

  public BottleController(BottleRepository bottles, CurrentUser currentUser){
    this.bottles=bottles;this.currentUser=currentUser;
    }

  @GetMapping public List<BottleResponse> list(){
    return bottles.findByAdminManagedTrueOrderBySizeAsc().stream().map(this::toResponse).toList();
    }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public BottleResponse create(Authentication auth,@Valid @RequestBody BottleRequest r){
    currentUser.requireStaff(auth);
    ensureUnique(r.size(), r.bottleType(), null);
    return toResponse(bottles.save(new Bottle(r.size(),r.bottleType(),r.price(),r.available(),r.description())));
    }

  @PutMapping("/{id}") 
  public BottleResponse update(Authentication auth,@PathVariable Long id,@Valid @RequestBody BottleRequest r){
    currentUser.requireStaff(auth);
    Bottle b=bottles.findById(id)
        .filter(Bottle::isAdminManaged)
        .orElseThrow(()->new IllegalArgumentException("Bottle not found."));
    ensureUnique(r.size(), r.bottleType(), id);
    b.setSize(r.size());
    b.setBottleType(r.bottleType());
    b.setPrice(r.price());
    b.setAvailable(r.available());
    b.setDescription(r.description());
    return toResponse(bottles.save(b));
    }

  @DeleteMapping("/{id}") 
  @ResponseStatus(HttpStatus.NO_CONTENT) 
  public void delete(Authentication auth,@PathVariable Long id){
    currentUser.requireStaff(auth);
    Bottle bottle = bottles.findById(id)
        .filter(Bottle::isAdminManaged)
        .orElseThrow(()->new IllegalArgumentException("Bottle not found."));
    bottles.delete(bottle);
    }

  private void ensureUnique(Integer size, String bottleType, Long currentId) {
    boolean duplicate = currentId == null
        ? bottles.existsBySizeAndBottleTypeAndAdminManagedTrue(size, bottleType)
        : bottles.existsBySizeAndBottleTypeAndAdminManagedTrueAndIdNot(size, bottleType, currentId);
    if (duplicate) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "A bottle with the same size and type already exists."
      );
    }
  }

  private BottleResponse toResponse(Bottle b){
    return new BottleResponse(b.getId(),b.getSize(),b.getBottleType(),b.getPrice(),b.isAvailable(),b.getDescription());
    }
    
  public record BottleRequest(@NotNull Integer size,@NotBlank String bottleType,@NotNull @DecimalMin("0.00") BigDecimal price,boolean available,String description){}
  public record BottleResponse(Long bottleId,Integer size,String bottleType,BigDecimal price,boolean available,String description){}
}
