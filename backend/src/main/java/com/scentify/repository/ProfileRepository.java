/*
 * Team member: Htoo Myat Aung (6831503006)
 * Backend tasks: profile persistence and profile lookup.
 */
package com.scentify.repository;

import com.scentify.domain.Profile;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProfileRepository extends JpaRepository<Profile, String> {
}
