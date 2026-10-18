package com.servicedesk.repo; import org.springframework.data.jpa.repository.JpaRepository; import com.servicedesk.model.SlaRule;
public interface SlaRuleRepository extends JpaRepository<SlaRule,String>{}
