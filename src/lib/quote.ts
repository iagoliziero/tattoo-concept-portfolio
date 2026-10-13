// Envio do pedido de orçamento. O destino ainda não foi escolhido: troque o
// corpo de sendQuote por uma das opções abaixo antes de publicar o site.
//
// - WhatsApp: abrir https://wa.me/<numero>?text=<texto> com nome, ideia e
//   local. O link não leva anexo; o desenho teria de ir à parte.
// - Serviço de formulário (Formspree, Web3Forms...): enviar um FormData com
//   os campos e o desenho (request.drawing) para o endereço do serviço.
//
// Enquanto isso, em desenvolvimento o pedido só aparece no console; no site
// publicado a função falha de propósito, para nenhum pedido se perder calado.

export interface QuoteRequest {
  name: string;
  idea: string;
  place: string;
  /** O desenho feito no braço, em PNG, ou null. */
  drawing: Blob | null;
}

export async function sendQuote(request: QuoteRequest): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Envio do pedido de orçamento ainda não configurado (src/lib/quote.ts).");
  }
  console.info("Pedido de orçamento (não enviado, destino não configurado):", {
    ...request,
    drawing: request.drawing ? `${request.drawing.type}, ${request.drawing.size} bytes` : null,
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
}
