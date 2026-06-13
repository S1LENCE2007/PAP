# Complemento para o Relatório de PAP (Prova de Aptidão Profissional) - Versão Final

Este documento contém os textos detalhados para preencher as secções que se encontram vazias no teu documento principal da PAP (`PAP.docx`). O conteúdo foi elaborado com rigor técnico, utilizando o mesmo tom formal em português de Portugal e alinhado exatamente com o código real da aplicação.

---

## Loja

A página da Loja Online (`Shop.tsx`) funciona como o catálogo de e-commerce da Barbearia Dourado. A sua principal função é exibir os produtos disponíveis para venda (como óleos de barba, pomadas modeladoras e kits de grooming) e permitir a filtragem por categorias (Cabelo, Barba, Acessórios) e pesquisa por texto livre.

Tecnicamente, o componente consome dados dinâmicos da tabela `produtos` do Supabase. A interface foi desenhada com componentes interativos e responsivos suportados por Tailwind CSS e animações do Framer Motion. Cada cartão de produto apresenta a imagem do produto, nome, categoria, preço formatado e o estado do stock. O sistema foi modificado para que os produtos estejam sempre disponíveis para compra de forma ilimitada, removendo as restrições visuais e overlays de stock nulo no catálogo para garantir uma experiência contínua e sem interrupções.

### Trecho de Código de Renderização e Filtros:
```tsx
const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
});
```

Loja-Erro 1
Explicação do Erro: Inicialmente, se o stock de um produto estivesse a zero na base de dados, a interface exibia um overlay vermelho escrito "Esgotado" e bloqueava completamente o botão de compra. Isto impedia os utilizadores de encomendarem produtos mesmo quando o proprietário da barbearia tinha o produto disponível fisicamente mas ainda não o tinha registado na base de dados.
Solução Implementada: Refatorou-se a interface do catálogo e dos detalhes do produto para omitir por completo qualquer bloqueio baseado em stock. Os botões de compra foram reativados permanentemente e as mensagens de alerta de stock escasso foram removidas, permitindo a livre adição de itens ao carrinho.

---

## Carrinho

O Carrinho de Compras (`Cart.tsx`) é gerido por um contexto global React (`CartContext.tsx`). Este componente permite que o utilizador centralize os produtos que pretende adquirir antes de finalizar a encomenda. O carrinho atualiza dinamicamente o subtotal de cada item, calcula o preço total final e permite incrementar ou decrementar a quantidade de cada produto, assim como remover itens da lista de compras.

O checkout integra um formulário onde o cliente pode fornecer informações adicionais e fechar o pedido, gerando um registo seguro na tabela de `encomendas` do Supabase com um código de validação único.

### Trecho de Código do Contexto de Adição ao Carrinho:
```tsx
const addToCart = (product: Product) => {
    setItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            return prev.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        }
        return [...prev, { ...product, quantity: 1 }];
    });
};
```

Carrinho-Erro 1
Explicação do Erro: O estado do carrinho de compras era volátil. Se o cliente adicionasse produtos e por engano recarregasse a página ou clicasse no botão "Voltar" do navegador, todo o estado do carrinho era redefinido para uma lista vazia, obrigando o utilizador a pesquisar e adicionar novamente todos os produtos.
Solução Implementada: Implementou-se a sincronização persistente do estado do carrinho no `localStorage` do navegador do utilizador através de um hook `useEffect` no `CartProvider`. O estado é automaticamente restaurado ao iniciar a aplicação.

Carrinho-Erro 2
Explicação do Erro: O botão de incremento de quantidade (+) do carrinho ficava bloqueado quando o utilizador atingia o limite da quantidade em stock registada na base de dados. Isto criava fricção de compra se o cliente pretendesse encomendar mais unidades sob encomenda direta com o barbeiro.
Solução Implementada: Removeu-se a restrição de incremento baseada no stock na página de carrinho. O botão "+" agora permite incrementar livremente a quantidade desejada, sem qualquer limite superior programático no frontend.

---

## Galeria

A Galeria de Trabalhos (`Gallery.tsx`) serve como portefólio visual da barbearia. Esta secção apresenta fotografias reais dos cortes de cabelo e estilos de barba efetuados pelos profissionais, funcionando como prova de conceito e inspiração para os clientes. 

A galeria consome dados dinâmicos da tabela `galeria` do Supabase e suporta filtros de visibilidade. A administração tem controlo total sobre quais as imagens que devem ser exibidas publicamente na plataforma.

### Trecho de Código de Renderização da Galeria:
```tsx
const { data, error } = await supabase
    .from('galeria')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: false });
```

Galeria-Erro 1
Explicação do Erro: Devido às diferentes orientações de captação de fotografias feitas nos telemóveis (horizontal vs vertical), as imagens na galeria apareciam distorcidas ou cortadas incorretamente, prejudicando a harmonia estética do portefólio da barbearia.
Solução Implementada: Aplicou-se um layout de grelha CSS responsivo (Grid) com as classes `aspect-square` e `object-cover` do Tailwind CSS em cada imagem, garantindo que todas as fotos mantêm a proporção quadrada uniforme independentemente do ficheiro original de upload.

---

## Avaliações

A secção de Avaliações (`Reviews.tsx`) é o canal onde os clientes autenticados partilham o seu feedback sobre o atendimento e serviços recebidos. Cada avaliação contém a classificação de 1 a 5 estrelas e um comentário de texto livre.

Este módulo consome dados da tabela `avaliacoes` e está interligado à tabela de perfis de utilizador para identificar o autor da avaliação de forma autêntica.

### Trecho de Código de Submissão de Avaliação:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('avaliacoes').insert([{
        cliente_id: user.id,
        nota,
        comentario
    }]);
    if (error) throw error;
    toast.success('Avaliação enviada com sucesso!');
};
```

Avaliações-Erro 1
Explicação do Erro: O formulário de avaliações permitia que qualquer utilizador submetesse comentários vazios ou avaliações com pontuações fora do intervalo de 1 a 5 estrelas contornando a validação visual do frontend, poluindo a base de dados.
Solução Implementada: Adicionou-se uma verificação rigorosa no lado do servidor com restrições SQL do tipo "check constraint" na coluna `nota` (`check (nota >= 1 and nota <= 5)`) e validações de submissão do formulário no React para garantir a consistência das notas.

---

## Contactos

A página de Contactos (`Contact.tsx`) disponibiliza os canais de comunicação da barbearia, tais como número de telemóvel, e-mail, redes sociais e horário de funcionamento. Integra ainda a localização geográfica exata do estabelecimento em Montemor-o-Velho recorrendo a um mapa dinâmico do Google Maps.

### Trecho de Código do Mapa Embutido:
```tsx
<iframe 
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3042.876..." 
  width="100%" 
  height="450" 
  style={{ border: 0 }} 
  allowFullScreen 
  loading="lazy"
/>
```

Contactos-Erro 1
Explicação do Erro: Em dispositivos móveis ou ligações de internet mais lentas, o mapa embutido do Google Maps demorava muito a carregar, exibindo um ecrã vazio que dava a falsa impressão de que a secção estava corrompida.
Solução Implementada: Adicionou-se a propriedade `loading="lazy"` à tag iframe e implementou-se um esqueleto de carregamento (Skeleton loader) temporário em CSS que indica visualmente que o mapa está em carregamento.

---

## Menu de Utilizador

O Menu de Utilizador é a área pessoal dedicada ao cliente após efetuar o login. Permite navegar de forma segura entre as suas secções de gestão pessoal.

### Perfil
A secção do Perfil de utilizador (`Profile.tsx`) permite ao cliente gerir a sua informação de contacto (nome, telemóvel e email). Os dados são atualizados diretamente na tabela `perfis` no Supabase.

Perfil-Erro 1
Explicação do Erro: Ao atualizar o telemóvel ou o nome no formulário de perfil, o cabeçalho do website que exibe as boas-vindas ao utilizador continuava a mostrar os dados antigos até que o utilizador atualizasse manualmente a página (F5) ou fizesse logout.
Solução Implementada: Integrou-se o formulário de atualização com o estado global do `AuthContext`. Ao gravar com sucesso as alterações na tabela `perfis`, o contexto é atualizado localmente de forma imediata, refletindo a alteração no cabeçalho em tempo real.

### Encomendas
Na área de Encomendas (`MyOrders.tsx`), o utilizador visualiza o histórico de todas as compras de produtos efetuadas na loja online da barbearia, incluindo o estado do pedido (Pendente, Concluído), código alfanumérico único da encomenda e itens adquiridos.

Encomendas-Erro 1
Explicação do Erro: A tabela original de encomendas armazenava o carrinho de compras no formato de texto JSON bruto. Ao renderizar a lista, o cliente via o código de programação no ecrã em vez de uma lista formatada de produtos.
Solução Implementada: Implementou-se uma função de conversão (`JSON.parse`) na renderização dos dados, mapeando a estrutura do JSON para uma tabela formatada de fácil leitura para o cliente final.

---

## Menu de Administrador

O Menu de Administrador é restrito aos utilizadores cuja coluna `role` na tabela `perfis` seja `admin`. Dá acesso total ao backoffice de gestão do negócio.

### Perfil
O perfil administrativo partilha da mesma estrutura dinâmica do perfil de utilizador básico, adaptado ao contexto de gestão.

### Encomendas
Nesta secção, o administrador visualiza todas as encomendas submetidas por todos os clientes da loja online, podendo acompanhar o estado e o histórico de compras global para fins contabilísticos.

### Validar Encomenda
O componente de Validação de Encomenda (`VerifyOrder.tsx`) é uma das funcionalidades mais avançadas da plataforma. Permite ao administrador introduzir manualmente o código de uma encomenda (ou ler um código correspondente) para obter de imediato os detalhes e alterar o estado da encomenda para "Concluído" quando o cliente levanta os produtos.

Validar Encomenda-Erro 1
Explicação do Erro: O processo de atualização do estado da encomenda falhava de forma silenciosa se o utilizador fizesse uma pesquisa rápida e clicasse em "Concluir" antes do Supabase terminar a ligação inicial, deixando a transação incompleta.
Solução Implementada: Desenvolveu-se um estado de carregamento (`isUpdating`) com um botão que muda para "A processar..." e bloqueia cliques sucessivos, impedindo chamadas redundantes ou cancelamentos de rede.

### Painel de Administrador
O Painel de Administrador (`Dashboard.tsx`) agrega dados estatísticos do negócio: total de faturação estimada, percentagem de marcações concluídas, listagem detalhada de produtos mais vendidos e gestão de marcações ativas. Permite ainda criar e gerir novos serviços, barbeiros, produtos e imagens da galeria.

Painel de Administrador-Erro 1
Explicação do Erro: Ao tentar calcular os totais mensais de faturação, o painel gerava um erro de execução JavaScript ("NaN" ou "Cannot read property") caso houvesse semanas onde nenhum serviço foi faturado, pois a base de dados retornava valores nulos.
Solução Implementada: Implementou-se um tratamento preventivo de dados com valores padrão (`|| 0`) e o método `coalesce` nas consultas SQL do Supabase, garantindo que o painel processa sempre valores numéricos válidos.

---

## Menu de Barbeiro

O Menu de Barbeiro é destinado aos utilizadores com a função `barbeiro`, permitindo que acedam de forma rápida ao seu ambiente de trabalho operacional.

### Perfil
Partilha da mesma estrutura de gestão de dados pessoais.

### Encomendas
Permite a visualização das encomendas geradas na plataforma para controlo interno e apoio na entrega.

### Validar Encomenda
Os barbeiros dispõem de acesso a esta secção para que possam concluir e entregar encomendas físicas aos clientes diretamente no balcão da barbearia.

### Painel de Barbeiro
O Painel de Barbeiro (`Dashboard.tsx` sob o layout do barbeiro) disponibiliza uma agenda diária filtrada. Ao contrário do administrador, o barbeiro visualiza exclusivamente a lista das suas próprias marcações de serviços agendadas pelos clientes para o dia corrente e seguintes.

Painel de Barbeiro-Erro 1
Explicação do Erro: Inicialmente, a consulta à tabela de agendamentos não filtrava pelo ID do barbeiro autenticado. Desta forma, qualquer barbeiro via a agenda completa de todos os colegas de trabalho, o que gerava confusão visual e risco de privacidade.
Solução Implementada: Refatorou-se a consulta SQL para aplicar um filtro direto correspondente ao ID do barbeiro atualmente logado (`eq('barbeiro_id', currentBarberId)`), garantindo uma visualização isolada e focada no trabalho de cada profissional.

---

## Conclusão

O desenvolvimento do projeto "Barbearia Dourado" representou uma excelente oportunidade para aplicar de forma prática e em contexto real as competências adquiridas no curso de Técnico de Gestão e Programação de Sistemas Informáticos (TGPSI). A transição técnica do Firebase para o Supabase demonstrou-se uma decisão acertada, evidenciando as vantagens práticas do modelo relacional SQL e da segurança ao nível da linha (RLS) no armazenamento de dados de agendamentos e vendas online.

A simplificação da gestão de inventário, através da desativação do controlo estrito de stock de produtos no frontend, permitiu entregar uma aplicação mais flexível e fluida para o modelo operacional atual do negócio local. O projeto foi concluído com sucesso, com todas as componentes de frontend e backoffice devidamente integradas, compiladas e publicadas em ambiente de produção, encontrando-se acessível e totalmente funcional no link de demonstração pública: `https://s1lence2007.github.io/PAP/`