package com.servicedesk.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="status_history") public class StatusHistory {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="history_id") public Integer historyId;
 @Column(name="ticket_id") public Integer ticketId; @Column(name="old_status") public String oldStatus; @Column(name="new_status") public String newStatus; @Column(name="changed_at") public LocalDateTime changedAt;
 @PrePersist void pre(){if(changedAt==null) changedAt=LocalDateTime.now();}
}
