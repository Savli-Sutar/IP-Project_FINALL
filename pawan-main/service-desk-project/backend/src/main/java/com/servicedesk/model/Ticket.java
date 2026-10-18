package com.servicedesk.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="tickets") public class Ticket {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="ticket_id") public Integer ticketId;
 public String title; @Column(columnDefinition="TEXT") public String description; public String category; public String priority; public String status;
 @Column(name="user_id") public Integer userId; @Column(name="created_at") public LocalDateTime createdAt;
 @PrePersist void pre(){ if(createdAt==null) createdAt=LocalDateTime.now(); if(status==null) status="New"; }
}
