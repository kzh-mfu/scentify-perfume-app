/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Backend tasks: Firebase Admin initialization and Identity Platform integration.
 */
package com.scentify.config;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.auth.oauth2.GoogleCredentials;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@Profile("!local")
public class FirebaseConfig {
  @Value("${GOOGLE_CLOUD_PROJECT_ID:}")
  private String projectId;

  @Bean
  FirebaseApp firebaseApp() throws IOException {
    if (FirebaseApp.getApps().isEmpty()) {
      FirebaseOptions.Builder options = FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.getApplicationDefault());
      if (!projectId.isBlank()) {
        options.setProjectId(projectId);
      }
      return FirebaseApp.initializeApp(options.build());
    }
    return FirebaseApp.getInstance();
  }
}
