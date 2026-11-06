
package br.com.vertice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
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
            SecurityContextRepository repository,
            ContaAtivaFilter contaAtivaFilter
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

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/automoveis"
                ).permitAll()

                .requestMatchers("/error").permitAll()

                // Administrador: somente gestão de contas.
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // Banco: somente operações bancárias.
                .requestMatchers("/api/banco/**")
                .hasRole("AGENTE_BANCO")

                // Empresa: administração de aluguéis.
                .requestMatchers("/api/agente/**")
                .hasRole("AGENTE_EMPRESA")

                // Cliente: área pessoal.
                .requestMatchers("/api/perfil/**")
                .hasRole("CLIENTE")

                .requestMatchers("/api/contratos/**")
                .hasRole("CLIENTE")

                // Pedidos do cliente.
                .requestMatchers("/api/pedidos/**")
                .hasRole("CLIENTE")

                // Outros endpoints de autenticação.
                .requestMatchers("/api/auth/**")
                .authenticated()

                // Demais endpoints não públicos.
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

            .addFilterBefore(
                contaAtivaFilter,
                AuthorizationFilter.class
            );

        return http.build();
    }
}
