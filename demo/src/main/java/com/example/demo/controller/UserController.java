// package com.example.demo.controller;

// import com.example.demo.model.User;
// import com.example.demo.repository.UserRepository;
// import com.example.demo.service.UserService;
// import jakarta.validation.Valid;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;

// @RestController
// @RequestMapping("/api/users")
// @CrossOrigin(origins = "${app.cors.allowed-origins}")
// public class UserController {
    
//     private final UserService userService;

//       @Autowired
//     private UserRepository userRepository;

//     // Manual constructor
//     public UserController(UserService userService) {
//         this.userService = userService;
//     }
    
//     @GetMapping
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<List<User>> getAllUsers() {
//         List<User> users = userService.getAllUsers();
//         return ResponseEntity.ok(users);
//     }
    
//     @GetMapping("/{id}")
//     public ResponseEntity<User> getUserById(@PathVariable String id) {
//         return userService.getUserById(id)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }
    
//     // @GetMapping("/profile")
//     // public ResponseEntity<User> getCurrentUserProfile() {
//     //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//     //     String email = authentication.getName();
//     //     User user = userService.getCurrentUserProfile(email);
//     //     return ResponseEntity.ok(user);
//     // }



//     @GetMapping("/profile")
//     public ResponseEntity<?> getUserProfile(Authentication authentication) {
//         try {
//             String email = authentication.getName();
//             User user = userRepository.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("User not found"));
            
//             return ResponseEntity.ok(user);
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @PostMapping
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
//         try {
//             User createdUser = userService.createUser(user);
//             return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @PutMapping("/{id}")
//     public ResponseEntity<?> updateUser(@PathVariable String id, @Valid @RequestBody User userDetails) {
//         try {
//             // Check if user is updating their own profile or is admin
//             Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//             String currentUserEmail = authentication.getName();
//             User currentUser = userService.getCurrentUserProfile(currentUserEmail);
            
//             User targetUser = userService.getUserById(id)
//                     .orElseThrow(() -> new RuntimeException("User not found"));
            
//             // Allow if current user is admin or updating their own profile
//             if (!currentUser.getRole().equals("ADMIN") && !currentUser.getId().equals(targetUser.getId())) {
//                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
//             }
            
//             User updatedUser = userService.updateUser(id, userDetails);
//             return ResponseEntity.ok(updatedUser);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @DeleteMapping("/{id}")
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<?> deleteUser(@PathVariable String id) {
//         try {
//             userService.deleteUser(id);
//             return ResponseEntity.ok().build();
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @GetMapping("/search")
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<List<User>> searchUsers(@RequestParam String name) {
//         List<User> users = userService.searchUsersByName(name);
//         return ResponseEntity.ok(users);
//     }
    
//     @GetMapping("/role/{role}")
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
//         List<User> users = userService.getUsersByRole(role);
//         return ResponseEntity.ok(users);
//     }
// }


// package com.example.demo.controller;

// import com.example.demo.model.User;
// import com.example.demo.repository.UserRepository;
// import com.example.demo.service.UserService;
// import jakarta.validation.Valid;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;
// import java.util.List;

// @RestController
// @RequestMapping("/api/users")
// @CrossOrigin(origins = "${app.cors.allowed-origins}")
// public class UserController {
    
//     private final UserService userService;

//     @Autowired
//     private UserRepository userRepository;

//     public UserController(UserService userService) {
//         this.userService = userService;
//     }
    
//     // Get current user profile - works with actual users from database
//     @GetMapping("/profile")
//     public ResponseEntity<?> getCurrentUserProfile(@RequestParam(required = false) String email) {
//         try {
//             // If email is provided, get that specific user
//             if (email != null && !email.isEmpty()) {
//                 User user = userRepository.findByEmail(email)
//                     .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
//                 return ResponseEntity.ok(user);
//             }
            
//             // If no email provided, get the first user from database (for demo)
//             User firstUser = userRepository.findAll().stream().findFirst()
//                 .orElseThrow(() -> new RuntimeException("No users found in database"));
            
//             return ResponseEntity.ok(firstUser);
            
//         } catch (Exception e) {
//             System.out.println("Error in getCurrentUserProfile: " + e.getMessage());
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }

//     // Alternative endpoint that works with user ID from token
//     @GetMapping("/my-profile")
//     public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String authHeader) {
//         try {
//             // Extract user email from token (you might need a JWT utility for this)
//             // For now, let's use a simple approach - get from SecurityContext
//             Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//             if (authentication != null && authentication.isAuthenticated()) {
//                 String email = authentication.getName();
//                 User user = userRepository.findByEmail(email)
//                     .orElseThrow(() -> new RuntimeException("User not found"));
//                 return ResponseEntity.ok(user);
//             }
//             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @GetMapping
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<List<User>> getAllUsers() {
//         List<User> users = userService.getAllUsers();
//         return ResponseEntity.ok(users);
//     }
    
//     @GetMapping("/{id}")
//     public ResponseEntity<User> getUserById(@PathVariable String id) {
//         return userService.getUserById(id)
//                 .map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }
    
//     @PostMapping
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
//         try {
//             User createdUser = userService.createUser(user);
//             return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @PutMapping("/{id}")
//     public ResponseEntity<?> updateUser(@PathVariable String id, @Valid @RequestBody User userDetails) {
//         try {
//             Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//             String currentUserEmail = authentication.getName();
//             User currentUser = userService.getCurrentUserProfile(currentUserEmail);
            
//             User targetUser = userService.getUserById(id)
//                     .orElseThrow(() -> new RuntimeException("User not found"));
            
//             if (!currentUser.getRole().equals("ADMIN") && !currentUser.getId().equals(targetUser.getId())) {
//                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
//             }
            
//             User updatedUser = userService.updateUser(id, userDetails);
//             return ResponseEntity.ok(updatedUser);
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
    
//     @DeleteMapping("/{id}")
//     @PreAuthorize("hasRole('ADMIN')")
//     public ResponseEntity<?> deleteUser(@PathVariable String id) {
//         try {
//             userService.deleteUser(id);
//             return ResponseEntity.ok().build();
//         } catch (RuntimeException e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
// }


// src/main/java/com/example/demo/controller/UserController.java
package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// NOTE: removed @PreAuthorize on /api/users to allow dev gating via property
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class UserController {
    
    private final UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /** Dev-friendly: if no email, return first user (same as your original) */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(@RequestParam(required = false) String email) {
        try {
            if (email != null && !email.isEmpty()) {
                User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
                return ResponseEntity.ok(user);
            }
            User firstUser = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No users found in database"));
            return ResponseEntity.ok(firstUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** IMPORTANT: no required header; use SecurityContext (returns 401 if not authenticated) */
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /** List users: admin-only when securityEnabled=true; open in dev when disabled */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        if (securityEnabled) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        }
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        if (securityEnabled) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        }
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @Valid @RequestBody User userDetails) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication != null ? authentication.getName() : null;
            User currentUser = currentUserEmail != null ? userService.getCurrentUserProfile(currentUserEmail) : null;
            
            User targetUser = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isAdmin = currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole());
            if (!isAdmin && (currentUser == null || !currentUser.getId().equals(targetUser.getId()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (securityEnabled) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
        }
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}