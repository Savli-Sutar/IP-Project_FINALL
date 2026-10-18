package com.servicedesk.model;
import jakarta.persistence.*;
@Entity @Table(name="users") public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="user_id") public Integer userId;
 public String name; @Column(unique=true,nullable=false) public String email; public String password; public String role;
}
