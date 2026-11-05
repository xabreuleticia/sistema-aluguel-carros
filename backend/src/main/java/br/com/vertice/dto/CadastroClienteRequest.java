
package br.com.vertice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CadastroClienteRequest(

    @NotBlank(message = "Informe seu nome.")
    String nome,

    @NotBlank(message = "Informe seu e-mail.")
    @Email(message = "E-mail inválido.")
    String email,

    @NotBlank(message = "Informe sua senha.")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres.")
    String senha,

    @NotBlank(message = "Informe seu CPF.")
    String cpf,

    @NotBlank(message = "Informe seu RG.")
    String rg,

    @NotBlank(message = "Informe seu endereço.")
    String endereco,

    @NotBlank(message = "Informe sua profissão.")
    String profissao,

    @Size(max = 3, message = "Informe no máximo 3 empregos.")
    List<@Valid EmpregoRequest> empregos

) {
    public record EmpregoRequest(

        @NotBlank(message = "Informe a empresa.")
        String empresa,

        @NotNull(message = "Informe o rendimento.")
        @DecimalMin(value = "0.0", inclusive = true,
                    message = "O rendimento não pode ser negativo.")
        BigDecimal rendimento

    ) {}
}
