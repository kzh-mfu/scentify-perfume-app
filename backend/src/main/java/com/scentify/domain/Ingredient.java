/*
 * Team member: Kyaw Zin Htike (6831503011)
 * Entity tasks: listing/searching, creating, updating, and deleting ingredients.
 */
package com.scentify.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ingredients")
public class Ingredient {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ingredient_id")
  private Long id;

  @Column(nullable = false, unique = true, length = 150)
  private String name;

  @Column(name = "scent_family", nullable = false, length = 100)
  private String scentFamily;

  @Column(nullable = false, length = 1000)
  private String description;

  @Column(nullable = false)
  private boolean available = true;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private LocalDateTime createdAt;

  protected Ingredient() {
  }

  public Ingredient(String name, String scentFamily, String description, boolean available) {
    this.name = name;
    this.scentFamily = scentFamily;
    this.description = description;
    this.available = available;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getScentFamily() { return scentFamily; }
  public void setScentFamily(String scentFamily) { this.scentFamily = scentFamily; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public boolean isAvailable() { return available; }
  public void setAvailable(boolean available) { this.available = available; }
  public LocalDateTime getCreatedAt() { return createdAt; }
}
