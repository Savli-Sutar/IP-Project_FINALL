package com.servicedesk.controller;
import com.servicedesk.model.*; import com.servicedesk.repo.*; import com.servicedesk.dto.*; import com.servicedesk.service.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api") @CrossOrigin(origins="*") public class ApiController {
 private final UserRepository users; private final SlaRuleRepository slas; private final TicketService service;
 public ApiController(UserRepository u,SlaRuleRepository s,TicketService t){users=u;slas=s;service=t;}
 @PostMapping("/auth/register") public Map<String,Object> register(@RequestBody User u){if(users.findByEmail(u.email).isPresent())throw new RuntimeException("Email already registered");u.role=("admin".equalsIgnoreCase(u.role)?"admin":"user");User saved=users.save(u);return user(saved);}
 @PostMapping("/auth/login") public Map<String,Object> login(@RequestBody LoginRequest r){User u=users.findByEmail(r.email().toLowerCase()).orElseThrow(()->new RuntimeException("Email or password is incorrect."));if(!u.password.equals(r.password()))throw new RuntimeException("Email or password is incorrect.");if(!u.role.equals(r.role()))throw new RuntimeException("That account is registered as "+(u.role.equals("admin")?"IT Support":"Employee")+", not the selected role.");return user(u);}
 private Map<String,Object> user(User u){return Map.of("userId",u.userId,"name",u.name,"email",u.email,"role",u.role);}
 @GetMapping("/sla") public List<SlaRule> sla(){return slas.findAll();}
 @PostMapping("/tickets") public Map<String,Object> create(@RequestBody TicketRequest r){return service.create(r);}
 @GetMapping("/tickets") public List<Map<String,Object>> all(){return service.all();}
 @GetMapping("/tickets/user/{id}") public List<Map<String,Object>> mine(@PathVariable Integer id){return service.mine(id);}
 @GetMapping("/tickets/{id}") public Map<String,Object> one(@PathVariable Integer id){return service.all().stream().filter(x->x.get("id").equals(id)).findFirst().orElseThrow();}
 @PutMapping("/tickets/{id}/status") public Map<String,Object> status(@PathVariable Integer id,@RequestBody StatusRequest r){return service.update(id,r.status());}
 @GetMapping("/stats") public Map<String,Long> stats(){var a=service.all();return Map.of("total",(long)a.size(),"new",a.stream().filter(x->x.get("status").equals("New")).count(),"progress",a.stream().filter(x->x.get("status").equals("In Progress")).count(),"resolved",a.stream().filter(x->x.get("status").equals("Resolved")||x.get("status").equals("Closed")).count(),"overdue",a.stream().filter(x->!(x.get("status").equals("Resolved")||x.get("status").equals("Closed"))&&((java.time.LocalDateTime)x.get("resolutionDueAt")).isBefore(java.time.LocalDateTime.now())).count());}
}
