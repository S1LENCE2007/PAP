"# Complemento para o Relatório de PAP (Prova de Aptidão Profissional)

Este documento contém os textos detalhados para preencher as secções que se encontram vazias no teu documento principal da PAP (`PAP.docx`). O conteúdo foi elaborado com rigor técnico, utilizando o mesmo tom formal em português de Portugal e alinhado exatamente com o código real da aplicação.

---

## 1. Loja

A página da Loja Online (`Shop.tsx`) funciona como o catálogo de e-commerce da Barbearia Dourado. A sua principal função é exibir os produtos disponíveis para venda (como óleos de barba, pomadas modeladoras e kits de grooming) e permitir a filtragem por categorias e pesquisa por texto.

Tecnicamente, o componente consome dados dinâmicos da tabela `produtos` do Supabase. A interface foi desenhada com componentes interativos e responsivos suportados por Tailwind CSS e animações do Framer Motion. Cada cartão de produto apresenta a imagem do produto, nome, categoria, preço formatado e o estado do stock. Se um produto estiver esgotado (stock igual a zero), o sistema desativa automaticamente os botões de compra e sobrepõe um aviso de "Esgotado". Quando restam poucas unidades, é exibido um alerta visual ("Apenas X unidades restantes!") para incentivar a compra (gatilho mental de escassez).

### Loja - Erro 1
* **Explicação do Erro:** Inicialmente, se o stock de um produto estivesse a zero na base de dados, a interface ainda permitia que o utilizador clicasse no botão "Adicionar". Embora a base de dados não permitisse a conclusão da encomenda, o utilizador ficava frustrado por conseguir adicionar itens inexistentes ao carrinho de compras.
* **Solução Implementada:** Implementou-se uma validação dupla no frontend. Na página da loja, o botão de compra é desativado (`disabled={product.stock === 0}`) e é aplicada uma classe CSS de opacidade e grayscale na imagem do produto. Além disso, o modal de detalhes do produto valida o stock antes de permitir a adição ao carrinho.

---

## 2. C
<truncated 9913 bytes>