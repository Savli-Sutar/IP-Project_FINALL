package com.servicedesk;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.servicedesk.model.SlaRule;
import com.servicedesk.model.User;
import com.servicedesk.repo.UserRepository;
import com.servicedesk.repo.SlaRuleRepository;

@SpringBootApplication
public class ServiceDeskApplication {
  public static void main(String[] args) { SpringApplication.run(ServiceDeskApplication.class, args); }
  @Bean CommandLineRunner seed(SlaRuleRepository repo, UserRepository users) { return args -> {
    seed(repo,"Critical","1h","4h"); seed(repo,"High","2h","8h"); seed(repo,"Medium","4h","24h"); seed(repo,"Low","8h","48h");
    if(users.findByEmail("support@company.com").isEmpty()){ User u=new User(); u.name="IT Support"; u.email="support@company.com"; u.password="password123"; u.role="admin"; users.save(u); }
    if(users.findByEmail("employee@company.com").isEmpty()){ User u=new User(); u.name="Employee"; u.email="employee@company.com"; u.password="password123"; u.role="user"; users.save(u); }
  }; }
  private void seed(SlaRuleRepository r,String p,String resp,String res){ if(!r.existsById(p)){r.save(new SlaRule(p,resp,res));} }
}
