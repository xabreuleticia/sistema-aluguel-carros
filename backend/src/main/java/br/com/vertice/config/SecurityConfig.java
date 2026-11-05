
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
import org.springframework.security.web.access.intercept.AuthorizationFilter;

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
            SecurityContextRepository repository,
            ContaAtivaFilter contaAtivaFilter
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

                // Consulta pública de automóveis
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/automoveis"
                ).permitAll()

                // Permite apresentar erros
                .requestMatchers("/error")
                .permitAll()

                // Endpoints de autenticação
                .requestMatchers("/api/auth/**")
                .authenticated()

                // Área exclusiva de agentes
                .requestMatchers("/api/agente/**")
                .hasRole("AGENTE")

                // Área exclusiva de clientes
                .requestMatchers("/api/perfil/**")
                .hasRole("CLIENTE")

                // Pedidos
                .requestMatchers("/api/pedidos/**")
                .hasAnyRole("CLIENTE", "AGENTE")

                // Demais endpoints
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
            )

            // Verifica se a conta continua ativa
            // antes de autorizar a requisição.
            .addFilterBefore(
                contaAtivaFilter,
                AuthorizationFilter.class
            );

        return http.build();
    }
}
