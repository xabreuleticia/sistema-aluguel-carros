
package br.com.vertice.service;

import br.com.vertice.model.Automovel;
import br.com.vertice.model.Cliente;
import br.com.vertice.model.Contrato;
import br.com.vertice.model.Pedido;
import br.com.vertice.model.Usuario;

import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.UsuarioRepository;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class ContratoPdfService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final AutomovelRepository automovelRepository;

    private static final Color VERDE =
            new Color(23, 63, 53);

    private static final Color BEGE =
            new Color(245, 242, 233);

    private static final Color CINZA =
            new Color(102, 115, 106);

    private static final DateTimeFormatter DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Locale BRASIL =
            Locale.forLanguageTag("pt-BR");

    public ContratoPdfService(
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            AutomovelRepository automovelRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.automovelRepository = automovelRepository;
    }

    public byte[] gerarPdf(Contrato contrato, Pedido pedido) {

        Cliente cliente = clienteRepository
                .findById(pedido.getClienteId())
                .orElseThrow(() -> new IllegalStateException(
                        "Cliente do pedido não encontrado."
                ));

        Usuario usuario = usuarioRepository
                .findById(cliente.getUsuarioId())
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário do cliente não encontrado."
                ));

        Automovel automovel = automovelRepository
                .findById(pedido.getAutomovelId())
                .orElseThrow(() -> new IllegalStateException(
                        "Automóvel do pedido não encontrado."
                ));

        ByteArrayOutputStream saida =
                new ByteArrayOutputStream();

        Document documento = new Document(
                PageSize.A4,
                48,
                48,
                48,
                48
        );

        try {
            PdfWriter.getInstance(documento, saida);

            documento.open();

            BaseFont fonteBase = BaseFont.createFont(
                    BaseFont.HELVETICA,
                    BaseFont.CP1252,
                    BaseFont.NOT_EMBEDDED
            );

            Font fonteMarca = new Font(
                    fonteBase, 25, Font.BOLD, VERDE
            );

            Font fonteTitulo = new Font(
                    fonteBase, 15, Font.BOLD, VERDE
            );

            Font fonteSecao = new Font(
                    fonteBase, 11, Font.BOLD, VERDE
            );

            Font fonteTexto = new Font(
                    fonteBase, 10, Font.NORMAL, VERDE
            );

            Font fonteRotulo = new Font(
                    fonteBase, 9, Font.NORMAL, CINZA
            );

            Font fonteBranca = new Font(
                    fonteBase, 10, Font.BOLD, Color.WHITE
            );

            // CABEÇALHO
            Paragraph marca = new Paragraph(
                    "VÉRTICE",
                    fonteMarca
            );

            marca.setAlignment(Element.ALIGN_CENTER);
            documento.add(marca);

            Paragraph assinaturaMarca = new Paragraph(
                    "EXPERIÊNCIAS QUE MOVEM",
                    fonteRotulo
            );

            assinaturaMarca.setAlignment(
                    Element.ALIGN_CENTER
            );
            assinaturaMarca.setSpacingAfter(22);

            documento.add(assinaturaMarca);

            Paragraph titulo = new Paragraph(
                    "RESUMO DO CONTRATO DE ALUGUEL",
                    fonteTitulo
            );

            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(8);

            documento.add(titulo);

            Paragraph numero = new Paragraph(
                    "Nº " + contrato.getNumero(),
                    fonteTexto
            );

            numero.setAlignment(Element.ALIGN_CENTER);
            numero.setSpacingAfter(24);

            documento.add(numero);

            // DADOS DO CLIENTE
            adicionarTituloSecao(
                    documento,
                    "01  |  DADOS DO CLIENTE",
                    fonteBranca
            );

            PdfPTable tabelaCliente = criarTabela();

            adicionarCampo(
                    tabelaCliente,
                    "NOME COMPLETO",
                    usuario.getNome(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaCliente,
                    "E-MAIL",
                    usuario.getEmail(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaCliente,
                    "CPF",
                    cliente.getCpf(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaCliente,
                    "RG",
                    cliente.getRg(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaCliente,
                    "PROFISSÃO",
                    cliente.getProfissao(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaCliente,
                    "ENDEREÇO",
                    cliente.getEndereco(),
                    fonteRotulo,
                    fonteTexto
            );

            documento.add(tabelaCliente);

            // DADOS DO AUTOMÓVEL
            adicionarTituloSecao(
                    documento,
                    "02  |  DADOS DO AUTOMÓVEL",
                    fonteBranca
            );

            PdfPTable tabelaAutomovel = criarTabela();

            adicionarCampo(
                    tabelaAutomovel,
                    "MARCA",
                    automovel.getMarca(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaAutomovel,
                    "MODELO",
                    automovel.getModelo(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaAutomovel,
                    "ANO",
                    String.valueOf(automovel.getAno()),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaAutomovel,
                    "PLACA",
                    automovel.getPlaca(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaAutomovel,
                    "MATRÍCULA",
                    automovel.getMatricula(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaAutomovel,
                    "VALOR DA DIÁRIA ATUAL",
                    moeda(automovel.getValorDiaria()),
                    fonteRotulo,
                    fonteTexto
            );

            documento.add(tabelaAutomovel);

            // DADOS DA LOCAÇÃO
            adicionarTituloSecao(
                    documento,
                    "03  |  INFORMAÇÕES DA LOCAÇÃO",
                    fonteBranca
            );

            PdfPTable tabelaLocacao = criarTabela();

            adicionarCampo(
                    tabelaLocacao,
                    "DATA DE RETIRADA",
                    pedido.getDataInicio().format(DATA),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaLocacao,
                    "DATA DE DEVOLUÇÃO",
                    pedido.getDataFim().format(DATA),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaLocacao,
                    "SITUAÇÃO DO PEDIDO",
                    pedido.getStatus(),
                    fonteRotulo,
                    fonteTexto
            );

            adicionarCampo(
                    tabelaLocacao,
                    "SITUAÇÃO DO CONTRATO",
                    contrato.getStatus(),
                    fonteRotulo,
                    fonteTexto
            );

            documento.add(tabelaLocacao);

            // VALOR TOTAL
            PdfPTable tabelaValor = new PdfPTable(1);
            tabelaValor.setWidthPercentage(100);
            tabelaValor.setSpacingBefore(18);

            PdfPCell celulaValor = new PdfPCell();

            celulaValor.setBackgroundColor(BEGE);
            celulaValor.setBorder(Rectangle.NO_BORDER);
            celulaValor.setPadding(16);

            Paragraph rotuloValor = new Paragraph(
                    "VALOR TOTAL DA LOCAÇÃO",
                    fonteRotulo
            );

            Paragraph valorTotal = new Paragraph(
                    moeda(pedido.getValorTotal()),
                    new Font(
                            fonteBase,
                            19,
                            Font.BOLD,
                            VERDE
                    )
            );

            celulaValor.addElement(rotuloValor);
            celulaValor.addElement(valorTotal);

            tabelaValor.addCell(celulaValor);
            documento.add(tabelaValor);

            // INFORMAÇÕES FINAIS
            Paragraph informacoes = new Paragraph(
                    "INFORMAÇÕES IMPORTANTES",
                    fonteSecao
            );

            informacoes.setSpacingBefore(25);
            informacoes.setSpacingAfter(8);

            documento.add(informacoes);

            Paragraph observacao = new Paragraph(
                    "Este documento apresenta os dados "
                    + "registrados no sistema VÉRTICE para "
                    + "a solicitação de aluguel aprovada. "
                    + "O valor da diária apresentado corresponde "
                    + "ao cadastro atual do automóvel e pode "
                    + "ser diferente do valor utilizado na "
                    + "formação do pedido. "
                    + "O valor total exibido corresponde "
                    + "ao valor registrado no pedido. "
                    + "Este resumo não substitui um "
                    + "instrumento contratual completo "
                    + "com cláusulas e aceite das partes.",
                    fonteTexto
            );

            observacao.setLeading(15);
            documento.add(observacao);

            Paragraph rodape = new Paragraph(
                    "VÉRTICE  |  DOCUMENTO GERADO PELO SISTEMA",
                    fonteRotulo
            );

            rodape.setAlignment(Element.ALIGN_CENTER);
            rodape.setSpacingBefore(28);

            documento.add(rodape);

            documento.close();

            return saida.toByteArray();

        } catch (Exception erro) {

            if (documento.isOpen()) {
                documento.close();
            }

            throw new IllegalStateException(
                    "Não foi possível gerar o PDF do contrato.",
                    erro
            );
        }
    }

    private PdfPTable criarTabela() {

        PdfPTable tabela = new PdfPTable(2);

        tabela.setWidthPercentage(100);
        tabela.setSpacingBefore(10);
        tabela.setSpacingAfter(16);

        return tabela;
    }

    private void adicionarTituloSecao(
            Document documento,
            String titulo,
            Font fonte
    ) throws Exception {

        PdfPTable tabela = new PdfPTable(1);
        tabela.setWidthPercentage(100);

        PdfPCell celula = new PdfPCell(
                new Phrase(titulo, fonte)
        );

        celula.setBackgroundColor(VERDE);
        celula.setBorder(Rectangle.NO_BORDER);
        celula.setPadding(10);

        tabela.addCell(celula);
        documento.add(tabela);
    }

    private void adicionarCampo(
            PdfPTable tabela,
            String rotulo,
            String valor,
            Font fonteRotulo,
            Font fonteTexto
    ) {

        PdfPCell celula = new PdfPCell();

        celula.setBorder(Rectangle.BOTTOM);
        celula.setBorderColor(
                new Color(220, 224, 216)
        );

        celula.setPadding(9);

        celula.addElement(
                new Paragraph(rotulo, fonteRotulo)
        );

        celula.addElement(
                new Paragraph(
                        valor != null && !valor.isBlank()
                                ? valor
                                : "Não informado",
                        fonteTexto
                )
        );

        tabela.addCell(celula);
    }

    private String moeda(BigDecimal valor) {

        if (valor == null) {
            return "Não informado";
        }

        return NumberFormat
                .getCurrencyInstance(BRASIL)
                .format(valor);
    }
}
