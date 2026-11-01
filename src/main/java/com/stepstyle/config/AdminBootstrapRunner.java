package com.stepstyle.config;

import com.stepstyle.entity.Cart;
import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.repository.CartRepository;
import com.stepstyle.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.bootstrap.username:admin}")
    private String adminUsername;

    @Value("${app.admin.bootstrap.email:admin@stepstyle.com}")
    private String adminEmail;

    @Value("${app.admin.bootstrap.password:}")
    private String adminPassword;

    @Value("${app.admin.bootstrap.first-name:System}")
    private String adminFirstName;

    @Value("${app.admin.bootstrap.last-name:Administrator}")
    private String adminLastName;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            CartRepository cartRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled via configuration (app.admin.bootstrap.enabled=false).");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            log.info("Admin bootstrap skipped: No ADMIN_BOOTSTRAP_PASSWORD environment variable supplied.");
            return;
        }

        var existingAdminOpt = userRepository.findByEmail(adminEmail)
                .or(() -> userRepository.findByUsername(adminUsername));
        if (existingAdminOpt.isPresent()) {
            User existingAdmin = existingAdminOpt.get();
            existingAdmin.setPasswordHash(passwordEncoder.encode(adminPassword));
            existingAdmin.setRole(Role.ROLE_ADMIN);
            existingAdmin.setActive(true);
            userRepository.save(existingAdmin);
            log.info("Admin bootstrap: Updated password for existing administrator account [{}] (username: {}).", adminEmail, existingAdmin.getUsername());
            return;
        }

        log.info("Bootstrapping initial system administrator account [{}]...", adminEmail);

        User admin = new User(
                adminUsername.trim(),
                adminEmail.trim().toLowerCase(),
                passwordEncoder.encode(adminPassword),
                adminFirstName.trim(),
                adminLastName.trim(),
                Role.ROLE_ADMIN
        );

        User savedAdmin = userRepository.save(admin);

        // Initialize admin shopping cart
        Cart adminCart = new Cart(savedAdmin);
        cartRepository.save(adminCart);

        log.info("Admin bootstrap completed: Successfully created initial administrator account [{}].", adminEmail);
    }
}
