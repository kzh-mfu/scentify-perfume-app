/*
 * Team member: Htoo Myat Aung (6831503006)
 * Backend tasks: profile loading/updating and profile relationships.
 */
package com.scentify.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scentify.domain.Profile;
import com.scentify.repository.ProfileRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@org.springframework.context.annotation.Profile("!local")
public class ProfileController {
  private final ProfileRepository profiles;
  private final CurrentUser currentUser;
  private final ObjectMapper objectMapper;

  public ProfileController(ProfileRepository profiles, CurrentUser currentUser, ObjectMapper objectMapper) {
    this.profiles = profiles;
    this.currentUser = currentUser;
    this.objectMapper = objectMapper;
  }

  @GetMapping
  public ProfileResponse get(Authentication authentication) {
    Profile profile = profiles.findById(currentUser.id(authentication))
        .orElseThrow(() -> new IllegalStateException("Profile not found."));
    String displayName = authentication.getName();
    if (authentication instanceof JwtAuthenticationToken jwt) {
      String tokenName = jwt.getToken().getClaimAsString("name");
      String tokenEmail = jwt.getToken().getClaimAsString("email");
      if (tokenName != null && !tokenName.isBlank()) {
        displayName = tokenName;
      } else if (tokenEmail != null && !tokenEmail.isBlank()) {
        displayName = tokenEmail.substring(0, tokenEmail.indexOf('@') > 0
            ? tokenEmail.indexOf('@')
            : tokenEmail.length());
      }
    }
    if (profile.getDisplayName().equals(profile.getId()) && !displayName.equals(profile.getId())) {
      profile.setDisplayName(displayName);
      profile = profiles.save(profile);
    }
    return response(profile);
  }

  @PutMapping
  public ProfileResponse update(
      Authentication authentication,
      @Valid @RequestBody ProfileRequest request
  ) {
    Profile profile = profiles.findById(currentUser.id(authentication))
        .orElseGet(() -> new Profile(currentUser.id(authentication), request.displayName(), "{}"));
    profile.setDisplayName(request.displayName());
    profile.setShippingAddress(writeJson(request.shippingAddress()));
    return response(profiles.save(profile));
  }

  private String writeJson(JsonNode value) {
    try {
      return objectMapper.writeValueAsString(value == null ? objectMapper.createObjectNode() : value);
    } catch (Exception exception) {
      throw new IllegalArgumentException("Shipping address must be valid JSON.", exception);
    }
  }

  private ProfileResponse response(Profile profile) {
    try {
      return new ProfileResponse(profile.getId(), profile.getDisplayName(),
          objectMapper.readTree(profile.getShippingAddress()));
    } catch (Exception exception) {
      throw new IllegalStateException("Stored profile address is invalid.", exception);
    }
  }

  public record ProfileRequest(@NotBlank String displayName, JsonNode shippingAddress) {
  }

  public record ProfileResponse(String id, String displayName, JsonNode shippingAddress) {
  }
}
