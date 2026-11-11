/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Shared backend tasks: staff/admin account management and role authorization.
 */
package com.scentify.api;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/staff")
@Profile("!local")
public class StaffController {
  private final CurrentUser currentUser;

  public StaffController(CurrentUser currentUser) {
    this.currentUser = currentUser;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.OK)
  public StaffResponse save(Authentication authentication, @Valid @RequestBody StaffRequest request) {
    currentUser.requireAdmin(authentication);
    try {
      if ("disable".equals(request.action())) {
        requireUserId(request);
        FirebaseAuth.getInstance().updateUser(new UserRecord.UpdateRequest(request.userId()).setDisabled(true));
        return new StaffResponse(request.userId());
      }

      if ("create".equals(request.action())) {
        if (request.password() == null || request.password().length() < 6) {
          throw new IllegalArgumentException("Staff passwords must be at least 6 characters.");
        }
        UserRecord.CreateRequest create = new UserRecord.CreateRequest()
            .setEmail(request.email().trim().toLowerCase())
            .setPassword(request.password())
            .setDisplayName(request.name().trim());
        UserRecord user = FirebaseAuth.getInstance().createUser(create);
        setRole(user.getUid(), request.role());
        return new StaffResponse(user.getUid());
      }

      if ("update".equals(request.action())) {
        requireUserId(request);
        UserRecord.UpdateRequest update = new UserRecord.UpdateRequest(request.userId())
            .setEmail(request.email().trim().toLowerCase())
            .setDisplayName(request.name().trim());
        if (request.password() != null && !request.password().isBlank()) {
          if (request.password().length() < 6) {
            throw new IllegalArgumentException("Staff passwords must be at least 6 characters.");
          }
          update.setPassword(request.password());
        }
        FirebaseAuth.getInstance().updateUser(update);
        setRole(request.userId(), request.role());
        return new StaffResponse(request.userId());
      }
      throw new IllegalArgumentException("Invalid staff action.");
    } catch (Exception exception) {
      throw new IllegalStateException("Google Identity Platform staff operation failed.", exception);
    }
  }

  private void setRole(String userId, String role) throws Exception {
    FirebaseAuth.getInstance().setCustomUserClaims(userId, java.util.Map.of("role", role));
  }

  private void requireUserId(StaffRequest request) {
    if (request.userId() == null || request.userId().isBlank()) {
      throw new IllegalArgumentException("A user ID is required.");
    }
  }

  public record StaffRequest(
      @NotBlank String action,
      String userId,
      @NotBlank String name,
      @NotBlank @Email String email,
      String password,
      @NotBlank String role,
      @NotBlank String title,
      @NotNull String phone
  ) {}

  public record StaffResponse(String userId) {}
}
