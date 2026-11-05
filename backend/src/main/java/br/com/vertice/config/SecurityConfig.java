
package br.com.vertice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository repository
    ) throws Exception {

        http
            .securityContext(context ->
                context.securityContextRepository(repository)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/auth/csrf"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/cadastro",
                    "/api/auth/login"
                ).permitAll()

                .requestMatchers("/api/auth/**")
                .authenticated()

                .requestMatchers("/api/agente/**")
                .hasRole("AGENTE")

                .requestMatchers("/api/pedidos/**")
                .hasAnyRole("CLIENTE", "AGENTE")

                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, exception) ->
                        response.sendError(401)
                )
                .accessDeniedHandler(
                    (request, response, exception) ->
                        response.sendError(403)
                )
            );

        return http.build();
    }
}
