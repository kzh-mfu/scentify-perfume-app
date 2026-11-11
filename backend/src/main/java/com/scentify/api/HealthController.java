/*
 * Team member: Htoo Myat Aung (6831503006)
 * Backend tasks: health endpoint and deployment smoke-check support.
 */
package com.scentify.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {
  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of("status", "ok", "service", "scentify-backend");
  }
}
