# Service Request & SLA Tracking System

Java Spring Boot + MySQL backend with the supplied HTML/CSS/JavaScript frontend.

## 1. Database
Open MySQL Workbench and run `database/schema.sql`.

## 2. Configure MySQL password
Edit:
`backend/src/main/resources/application.properties`

Set:
`spring.datasource.password=YOUR_MYSQL_PASSWORD`

## 3. Run
Open PowerShell in the `backend` folder:

```powershell
mvn spring-boot:run
```

Or run `run.bat` from the project root.

## 4. Open
http://localhost:8080/index.html

## Demo accounts
Employee: employee@company.com / password123
IT Support: support@company.com / password123

The backend automatically creates the demo accounts and SLA rules if they do not already exist.
