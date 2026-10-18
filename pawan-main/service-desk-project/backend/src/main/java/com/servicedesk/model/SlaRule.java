package com.servicedesk.model;
import jakarta.persistence.*;
@Entity @Table(name="sla_rules") public class SlaRule {
 @Id public String priority; @Column(name="reponse_time_limit") public String responseTimeLimit; @Column(name="resolution_time_limit") public String resolutionTimeLimit;
 public SlaRule(){} public SlaRule(String p,String r,String x){priority=p;responseTimeLimit=r;resolutionTimeLimit=x;}
}
