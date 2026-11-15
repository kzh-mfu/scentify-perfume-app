package com.scentify.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "formula_details")

public class FormulaDetail {
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)

  @Column(name = "formula_detail_id") 
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)

  @JoinColumn(name = "formula_id", nullable = false) 
  private Formula formula;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)

  @JoinColumn(name = "ingredient_id", nullable = false) 
  private Ingredient ingredient;

  @Column(name = "note_type", nullable = false, length = 20) 
  private String noteType;

  @Column(precision = 5, scale = 2) 
  private BigDecimal percentage;

  protected FormulaDetail() {}

  public FormulaDetail(Ingredient ingredient, String noteType, BigDecimal percentage){
    this.ingredient=ingredient;
    this.noteType=noteType;
    this.percentage=percentage;
    }

  void setFormula(Formula formula){
    this.formula=formula;
    }
    
  public Long getId(){return id;} 
  public Formula getFormula(){return formula;} 
  public Ingredient getIngredient(){return ingredient;}
  public String getNoteType(){return noteType;} 
  public BigDecimal getPercentage(){return percentage;}
}
