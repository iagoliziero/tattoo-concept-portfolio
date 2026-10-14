/**
 * Atributos de um link externo. Sem endereço (contato ainda não preenchido em
 * site.ts), o elemento continua no lugar, com a mesma aparência, mas não leva a
 * lugar nenhum: um <a> sem href é só um espaço reservado para o link.
 */
export function externalLink(url: string | null) {
  return url ? { href: url, target: "_blank", rel: "noopener" } : {};
}
