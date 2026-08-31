package com.ocp.pdr;

import com.ocp.pdr.model.Administrateur;
import com.ocp.pdr.repository.AdministrateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AdministrateurRepository administrateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Migration automatique des colonnes vers TEXT/LONGTEXT pour éviter la troncature MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE article_pdr MODIFY COLUMN reference TEXT");
            jdbcTemplate.execute("ALTER TABLE article_pdr MODIFY COLUMN description TEXT");
            jdbcTemplate.execute("ALTER TABLE article_pdr MODIFY COLUMN categorie TEXT");
            jdbcTemplate.execute("ALTER TABLE bom MODIFY COLUMN reference LONGTEXT");
        } catch (Exception ignored) {
            // Ignoré si la table n'existe pas encore ou selon le dialecte
        }

        String testEmail = "admin@ocp.ma";
        
        Optional<Administrateur> existingAdmin = administrateurRepository.findAll().stream()
                .filter(a -> a.getEmail().equals(testEmail))
                .findFirst();

        if (existingAdmin.isEmpty()) {
            Administrateur admin = new Administrateur();
            admin.setNom("Admin");
            admin.setPrenom("Test");
            admin.setEmail(testEmail);
            admin.setMotDePasse(passwordEncoder.encode("password123"));
            admin.setActif(true);
            
            administrateurRepository.save(admin);
            System.out.println("Compte administrateur de test créé avec succès !");
            System.out.println("Email: " + testEmail);
            System.out.println("Mot de passe: password123");
        } else {
            System.out.println("Le compte administrateur de test existe déjà.");
        }
    }
}

