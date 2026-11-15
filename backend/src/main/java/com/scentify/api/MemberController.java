package com.scentify.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.ExportedUserRecord;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.ListUsersPage;
import com.scentify.domain.Profile;
import com.scentify.repository.ProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin/members")
@org.springframework.context.annotation.Profile("!local")
public class MemberController {
  private final CurrentUser currentUser;
  private final ProfileRepository profiles;
  private final ObjectMapper objectMapper;

  public MemberController(
      CurrentUser currentUser,
      ProfileRepository profiles,
      ObjectMapper objectMapper
  ) {
    this.currentUser = currentUser;
    this.profiles = profiles;
    this.objectMapper = objectMapper;
  }

  @GetMapping
  public List<MemberResponse> list(Authentication authentication) {
    currentUser.requireAdmin(authentication);

    List<ExportedUserRecord> firebaseUsers = new ArrayList<>();
    try {
      ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);
      while (page != null) {
        page.getValues().forEach(firebaseUsers::add);
        page = page.hasNextPage() ? page.getNextPage() : null;
      }
    } catch (FirebaseAuthException exception) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Unable to load registered customer accounts from Firebase.",
          exception
      );
    }

    List<String> userIds = firebaseUsers.stream().map(ExportedUserRecord::getUid).toList();
    Map<String, Profile> profilesById = new HashMap<>();
    profiles.findAllById(userIds).forEach(profile -> profilesById.put(profile.getId(), profile));

    return firebaseUsers.stream()
        .filter(user -> !isStudioStaff(user.getCustomClaims()))
        .map(user -> {
          String email = user.getEmail() == null ? "" : user.getEmail();
          String name = user.getDisplayName();
          if (name == null || name.isBlank()) {
            int separator = email.indexOf('@');
            name = email.isBlank()
                ? "Customer"
                : separator > 0 ? email.substring(0, separator) : email;
          }
          return new MemberResponse(
              user.getUid(),
              name,
              email,
              user.getPhoneNumber() == null ? "" : user.getPhoneNumber(),
              formatAddress(profilesById.get(user.getUid())),
              "customer");
        })
        .toList();
  }

  private boolean isStudioStaff(Map<String, Object> claims) {
    Object role = claims == null ? null : claims.get("role");
    return "admin".equals(role) || "staff".equals(role) || "perfumer".equals(role);
  }

  private String formatAddress(Profile profile) {
    if (profile == null || profile.getShippingAddress() == null || profile.getShippingAddress().isBlank()) {
      return "";
    }
    try {
      JsonNode address = objectMapper.readTree(profile.getShippingAddress());
      if (!address.isObject()) {
        return address.asText("");
      }
      return Stream.of("address", "city", "province", "postalCode", "country")
          .map(address::path)
          .map(JsonNode::asText)
          .filter(value -> !value.isBlank())
          .collect(Collectors.joining(", "));
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException(
          "Stored shipping address is invalid for profile " + profile.getId() + ".",
          exception
      );
    }
  }

  public record MemberResponse(
      String userId,
      String name,
      String email,
      String phone,
      String address,
      String role
  ) {
  }
}
