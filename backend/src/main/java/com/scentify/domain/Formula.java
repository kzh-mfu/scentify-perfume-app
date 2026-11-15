package com.scentify.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formulas")

public class Formula {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)

  @Column(name = "formula_id") 
  private Long id;

  @Column(name = "user_id", length = 128) 
  private String userId;

  @Column(name = "formula_name", nullable = false) 
  private String formulaName;

  @Column(length = 1000) 
  private String description;

  @Column(name = "is_active", nullable = false) 
  private boolean active = true;

  @Column(name = "created_at", insertable = false, updatable = false) 
  private OffsetDateTime createdAt;

  @OneToMany(mappedBy = "formula", cascade = CascadeType.ALL, orphanRemoval = true)

  private List<FormulaDetail> details = new ArrayList<>();

  protected Formula() {}

  public Formula(String userId, String formulaName, String description, boolean active){
    this.userId=userId;
    this.formulaName=formulaName;
    this.description=description;
    this.active=active;
    }

  public void addDetail(FormulaDetail detail){
    details.add(detail); 
    detail.setFormula(this);
    }

  public Long getId(){return id;} 
  public String getUserId(){return userId;}
  public String getFormulaName(){return formulaName;} 
  public void setFormulaName(String v){formulaName=v;}
  public String getDescription(){return description;} 
  public void setDescription(String v){description=v;}
  public boolean isActive(){return active;} 
  public void setActive(boolean v){active=v;}
  public OffsetDateTime getCreatedAt(){return createdAt;} 
  public List<FormulaDetail> getDetails(){return details;}
}
