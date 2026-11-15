/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Shared backend tasks: staff/admin account management and role authorization.
 */
package com.scentify.api;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.UserRecord;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        return new StaffResponse(request.userId(), false);
      }

      if ("create".equals(request.action())) {
        return createStaffAccount(request);
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
        return new StaffResponse(request.userId(), false);
      }
      throw new org.springframework.web.server.ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Invalid staff action."
      );
    } catch (org.springframework.web.server.ResponseStatusException exception) {
      throw exception;
    } catch (FirebaseAuthException exception) {
      if (exception.getAuthErrorCode() == AuthErrorCode.EMAIL_ALREADY_EXISTS) {
        throw new org.springframework.web.server.ResponseStatusException(
            HttpStatus.CONFLICT, "An account with this email already exists.", exception
        );
      }
      if (exception.getAuthErrorCode() == AuthErrorCode.USER_NOT_FOUND) {
        throw new org.springframework.web.server.ResponseStatusException(
            HttpStatus.NOT_FOUND, "Firebase account not found.", exception
        );
      }
      throw new IllegalStateException("Google Identity Platform staff operation failed.", exception);
    } catch (Exception exception) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Google Identity Platform staff operation failed.",
          exception
      );
    }
  }

  private StaffResponse createStaffAccount(StaffRequest request) throws FirebaseAuthException {
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();
    String email = request.email().trim().toLowerCase();
    UserRecord user;
    boolean existingAccount;
    try {
      user = firebaseAuth.getUserByEmail(email);
      existingAccount = true;
    } catch (FirebaseAuthException exception) {
      if (exception.getAuthErrorCode() != AuthErrorCode.USER_NOT_FOUND
          && exception.getAuthErrorCode() != AuthErrorCode.EMAIL_NOT_FOUND) {
        throw exception;
      }
      if (request.password() == null || request.password().length() < 6) {
        throw new org.springframework.web.server.ResponseStatusException(
            HttpStatus.BAD_REQUEST, "New staff account passwords must be at least 6 characters."
        );
      }
      try {
        user = firebaseAuth.createUser(new UserRecord.CreateRequest()
            .setEmail(email)
            .setPassword(request.password())
            .setDisplayName(request.name().trim()));
        existingAccount = false;
      } catch (FirebaseAuthException createException) {
        if (createException.getAuthErrorCode() != AuthErrorCode.EMAIL_ALREADY_EXISTS) {
          throw createException;
        }
        user = firebaseAuth.getUserByEmail(email);
        existingAccount = true;
      }
    }

    if (existingAccount) {
      firebaseAuth.updateUser(new UserRecord.UpdateRequest(user.getUid())
          .setDisplayName(request.name().trim())
          .setDisabled(false));
    }
    setRole(user.getUid(), request.role());
    return new StaffResponse(user.getUid(), existingAccount);
  }

  private void setRole(String userId, String role) throws FirebaseAuthException {
    FirebaseAuth.getInstance().setCustomUserClaims(userId, java.util.Map.of("role", role));
  }

  private void requireUserId(StaffRequest request) {
    if (request.userId() == null || request.userId().isBlank()) {
      throw new org.springframework.web.server.ResponseStatusException(
          HttpStatus.BAD_REQUEST, "A user ID is required."
      );
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

  public record StaffResponse(String userId, boolean existingAccount) {}
}
