package com.example.demo.model;

public class AuthenticationResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;
    private String role;
    private String id;
    
    // Constructors
    public AuthenticationResponse() {}
    
    public AuthenticationResponse(String token, String email, String name, String role, String id) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.role = role;
        this.id = id;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}