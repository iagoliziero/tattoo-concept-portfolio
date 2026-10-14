// Envio do pedido de orçamento. O destino ainda não foi escolhido: troque o
// corpo de sendQuote por uma das opções abaixo antes de publicar o site.
//
// - WhatsApp: abrir https://wa.me/<numero>?text=<texto> com nome, ideia e
//   local. O link não leva anexo; a imagem teria de ir à parte.
// - Serviço de formulário (Formspree, Web3Forms...): enviar um FormData com
//   os campos e a imagem de referência (request.reference) para o endereço do serviço.
//
// Enquanto isso, em desenvolvimento o pedido só aparece no console; no site
// publicado a função falha de propósito, para nenhum pedido se perder calado.

export interface QuoteRequest {
  name: string;
  idea: string;
  place: string;
  /** Imagem de referência enviada pelo visitante, ou null. */
  reference: File | null;
}

export async function sendQuote(request: QuoteRequest): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Envio do pedido de orçamento ainda não configurado (src/lib/quote.ts).");
  }
  console.info("Pedido de orçamento (não enviado, destino não configurado):", {
    ...request,
    reference: request.reference ? `${request.reference.name} (${request.reference.type}, ${request.reference.size} bytes)` : null,
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
}
