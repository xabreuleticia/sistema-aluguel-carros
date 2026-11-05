
package br.com.vertice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
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

                // Permite obter o token CSRF
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/auth/csrf"
                ).permitAll()

                // Permite cadastro e login
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/cadastro",
                    "/api/auth/login"
                ).permitAll()

                // Permite consultar os automóveis disponíveis
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/automoveis"
                ).permitAll()

                // Demais endpoints de autenticação
                .requestMatchers("/api/auth/**")
                .authenticated()

                // Apenas agentes podem acessar esta área
                .requestMatchers("/api/agente/**")
                .hasRole("AGENTE")

                // Clientes autenticados podem consultar
                // e criar pedidos; agentes também podem acessar
                .requestMatchers("/api/pedidos/**")
                .hasAnyRole("CLIENTE", "AGENTE")

                // Todas as demais requisições exigem login
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
