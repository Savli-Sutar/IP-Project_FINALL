package com.servicedesk.repo; import org.springframework.data.jpa.repository.JpaRepository; import com.servicedesk.model.Ticket; import java.util.*;
public interface TicketRepository extends JpaRepository<Ticket,Integer>{List<Ticket> findByUserIdOrderByCreatedAtDesc(Integer userId);}
