package com.servicedesk.repo; import org.springframework.data.jpa.repository.JpaRepository; import com.servicedesk.model.StatusHistory; import java.util.*;
public interface StatusHistoryRepository extends JpaRepository<StatusHistory,Integer>{List<StatusHistory> findByTicketIdOrderByChangedAtAsc(Integer ticketId);}
