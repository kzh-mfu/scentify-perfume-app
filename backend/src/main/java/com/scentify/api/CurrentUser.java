/*
 * Shared backend tasks:
 * validate Firebase users and enforce customer, staff, and admin roles.
 */
package com.scentify.api;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CurrentUser {
  public String id(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new IllegalStateException("Authentication is required.");
    }
    return authentication.getName();
  }

  public void requireStaff(Authentication authentication) {
    requireRole(authentication, false);
  }

  public void requireAdmin(Authentication authentication) {
    requireRole(authentication, true);
  }

  private void requireRole(Authentication authentication, boolean adminOnly) {
    if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
      throw new IllegalStateException("A staff JWT is required.");
    }
    Object role = jwtAuthentication.getToken().getClaims().get("role");
    if (role == null) {
      Object metadata = jwtAuthentication.getToken().getClaims().get("app_metadata");
      role = metadata instanceof Map<?, ?> appMetadata ? appMetadata.get("role") : null;
    }
    if (adminOnly ? !"admin".equals(role)
        : (!"admin".equals(role) && !"staff".equals(role) && !"perfumer".equals(role))) {
      throw new IllegalStateException("Staff role is required.");
    }
  }
}
