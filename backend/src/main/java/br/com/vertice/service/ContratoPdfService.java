
package br.com.vertice.service;

import br.com.vertice.model.Contrato;
import br.com.vertice.model.Pedido;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class ContratoPdfService {

    private static final DateTimeFormatter DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Locale BRASIL =
            Locale.forLanguageTag("pt-BR");

    public byte[] gerarPdf(Contrato contrato, Pedido pedido) {

        ByteArrayOutputStream saida =
                new ByteArrayOutputStream();

        Document documento = new Document();

        try {
            PdfWriter.getInstance(documento, saida);

            documento.open();

            Font titulo = new Font(
                    Font.HELVETICA,
                    22,
                    Font.BOLD
            );

            Font subtitulo = new Font(
                    Font.HELVETICA,
                    14,
                    Font.BOLD
            );

            Font texto = new Font(
                    Font.HELVETICA,
                    11,
                    Font.NORMAL
            );

            Paragraph marca = new Paragraph(
                    "VERTICE",
                    titulo
            );
            marca.setAlignment(Element.ALIGN_CENTER);
            documento.add(marca);

            Paragraph cabecalho = new Paragraph(
                    "CONTRATO DE ALUGUEL DE AUTOMOVEL",
                    subtitulo
            );
            cabecalho.setAlignment(Element.ALIGN_CENTER);
            cabecalho.setSpacingBefore(15);
            cabecalho.setSpacingAfter(30);

            documento.add(cabecalho);

            documento.add(new Paragraph(
                    "Numero do contrato: " + contrato.getNumero(),
                    texto
            ));

            documento.add(new Paragraph(
                    "Situacao: " + contrato.getStatus(),
                    texto
            ));

            documento.add(new Paragraph(
                    "Identificador do pedido: " + pedido.getId(),
                    texto
            ));

            documento.add(new Paragraph(
                    "Identificador do automovel: "
                            + pedido.getAutomovelId(),
                    texto
            ));

            documento.add(new Paragraph(
                    "Data de retirada: "
                            + pedido.getDataInicio().format(DATA),
                    texto
            ));

            documento.add(new Paragraph(
                    "Data de devolucao: "
                            + pedido.getDataFim().format(DATA),
                    texto
            ));

            NumberFormat moeda =
                    NumberFormat.getCurrencyInstance(BRASIL);

            BigDecimal valor = pedido.getValorTotal();

            documento.add(new Paragraph(
                    "Valor total: " + moeda.format(valor),
                    texto
            ));

            Paragraph observacao = new Paragraph(
                    "Este documento apresenta os dados "
                    + "do aluguel registrados no sistema VERTICE. "
                    + "Nao substitui um instrumento contratual "
                    + "completo com clausulas e aceite das partes.",
                    texto
            );

            observacao.setSpacingBefore(35);
            documento.add(observacao);

            documento.close();

            return saida.toByteArray();

        } catch (Exception erro) {
            if (documento.isOpen()) {
                documento.close();
            }

            throw new IllegalStateException(
                    "Nao foi possivel gerar o PDF do contrato.",
                    erro
            );
        }
    }
}
