# Documentação Técnica - Barbearia Dourado

## Índice
1. [Introdução e Enquadramento](#1-introdução-e-enquadramento)
2. [Arquitetura e Tecnologias](#2-arquitetura-e-tecnologias)
3. [Modelação de Dados (Base de Dados)](#3-modelação-de-dados-base-de-dados)
4. [Funcionalidades da Aplicação Web](#4-funcionalidades-da-aplicação-web)
5. [Funcionalidades Administrativas (Backoffice)](#5-funcionalidades-administrativas-backoffice)
6. [Desafios de Implementação e Soluções (Deep Dive)](#6-desafios-de-implementação-e-soluções-deep-dive)
7. [Instalação e Manual de Utilização](#7-instalação-e-manual-de-utilização)
8. [Conclusão e Melhorias Futuras](#8-conclusão-e-melhorias-futuras)

---

## 1. Introdução e Enquadramento

### Visão Geral
A **Barbearia Dourado** é uma aplicação web moderna desenvolvida para modernizar a gestão de uma barbearia tradicional. O projeto visa substituir os métodos manuais de agendamento (papel e telefone) por uma solução digital integrada que funciona 24/7.

### Problema e Solução
**Problema:** A gestão de marcações por telefone causa interrupções constantes no trabalho dos barbeiros, erros de sobreposição de horários e dificuldade em gerir a base de dados de clientes.
**Solução:** Uma plataforma online onde os clientes podem consultar a disponibilidade em tempo real, marcar cortes, e comprar produtos, libertando os profissionais para se focarem no serviço.

### Objetivos
*   Digitalizar 100% dos agendamentos.
*   Centralizar a gestão de clientes, histórico de cortes e faturação.
*   Criar um canal de vendas online para produtos de cuidado pessoal.

---

## 2. Arquitetura e Tecnologias

### Tech Stack
O projeto foi construído utilizando uma stack moderna focada em performance e escalabilidade:

*   **Frontend**: React 19 (UI Interativa), TypeScript (Segurança de Código), Tailwind CSS (Estilo Responsivo).
*   **Backend & Database**: Supabase (PostgreSQL, Autenticação, Storage e Realtime).
*   **Ferramentas**: Vite (Build Tool), Framer Motion (Animações), Lucide React (Ícones).

### Arquitetura de Pastas
A estrutura do projeto segue as boas práticas de React:
*   `src/components`: Blocos reutilizáveis (Botões, Modais, Cards).
*   `src/pages`: As vistas principais (Home, Booking, Dashboard).
*   `src/contexts`: Gestão de estado global (AuthContext para utilizador, CartContext para compras).
*   `src/utils`: Funções auxiliares e cliente Supabase.

### Fluxo de Dados
A aplicação segue um modelo **Client-Serverless**:
1.  O Frontend faz pedidos diretos à API do Supabase via biblioteca cliente (`@supabase/supabase-js`).
2.  O Supabase gere a autenticação e retorna dados em JSON.
3.  As regras de segurança (RLS - Row Level Security) garantem que cada utilizador só acede ao que lhe é permitido diretamente na base de dados.

---

## 3. Modelação de Dados (Base de Dados)

### Diagrama ER e Modelo de dados

A base de dados evoluiu de uma estrutura simples para um modelo relacional robusto.

**Entidades Principais:**
*   **Perfis**: Extensão da tabela `auth.users`, guarda dados públicos (Nome, Telemóvel).
*   **Barbeiros**: Profissionais que prestam serviços.
*   **Marcacoes**: A tabela central que une Cliente, Barbeiro e Serviço numa data específica.
*   **Produtos**: Itens vendáveis na loja.

### Dicionário de Dados

#### Tabela Perfis
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária (FK de auth.users) |
| role | text | 'cliente', 'barbeiro' ou 'admin' |
| nav | text | Dados pessoais |

#### Tabela Marcacoes
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único do agendamento |
| cliente_id | uuid | Quem marcou (FK Perfis) |
| barbeiro_id | uuid | Com quem marcou (FK Barbeiros) |
| servico_id | uuid | O que vai fazer (FK Servicos) |
| data_hora | timestamp | Quando (Data e Hora UTC) |
| status | text | 'pendente', 'confirmado', 'cancelado' |

### SQL e Segurança
A segurança é garantida por **Triggers** e **RLS Policies**.
*   **Trigger `handle_new_user`**: Cria automaticamente um perfil quando um utilizador se regista.
*   **RLS**: Um cliente só pode ver (`SELECT`) os seus próprios agendamentos, mas um Admin pode ver todos.

---

## 4. Funcionalidades da Aplicação Web

### Módulo Cliente (Análise Técnica Detalhada)

Esta secção detalha a implementação das funcionalidades críticas focadas na experiência do utilizador.

#### 1. Gestão de Identidade (Autenticação)
*   **Implementação**: O sistema utiliza o serviço **Supabase Auth** como Identity Provider (IdP). O frontend envia as credenciais (email/password) para a API, que retorna um **JWT (JSON Web Token)** de sessão com validade temporária.
*   **Segurança (AuthContext)**: O estado da sessão é gerido globalmente pelo `AuthContext` (React Context API). Este componente subscreve aos eventos `onAuthStateChange` do Supabase, garantindo que o token é renovado automaticamente (Refresh Token) ou que o utilizador é desconectado se a sessão expirar.
*   **Proteção de Dados**: Ao nível da base de dados, foram implementadas políticas **RLS (Row Level Security)**. Por exemplo, a política `Users can update own profile` garante estritamente que `auth.uid() = id`, impedindo qualquer acesso não autorizado via API.

#### 2. Motor de Agendamento Inteligente
*   **Fluxo Sequencial**: A interface guia o utilizador por etapas (Barbeiro -> Serviço -> Data) para reduzir a carga cognitiva. O estado de cada etapa é preservado até à confirmação.
*   **Algoritmo de Disponibilidade (`getRealAvailableSlots`)**:
    1.  **Input**: Recebe a data selecionada e a duração do serviço (ex: 45 min) da tabela `servicos`.
    2.  **Query**: Executa um `SELECT` na tabela `Marcacoes` filtrando apenas pelo dia e barbeiro relevantes.
    3.  **Processamento**: Gera slots virtuais de 30 em 30 minutos (09:00, 09:30...).
    4.  **Validação Matemática**: Para cada slot, utiliza as funções `isBefore` e `isAfter` (date-fns) para verificar se o intervalo `[SlotStart, SlotEnd]` colide com algum intervalo de agendamento existente `[AptStart, AptEnd]`.
    5.  **Output**: Retorna ao frontend apenas a lista de horários livres, eliminando a possibilidade de erro humano na escolha.

#### 3. E-commerce Integrado
*   **Gestão de Estado (Client-Side)**: O carrinho de compras não sobrecarrega a base de dados. É gerido inteiramente no cliente via `CartContext` e persistido no `localStorage` do browser para resistir a "page reloads".
*   **Validação de Stock Otimista**: A função `addToCart` implementa uma guarda lógica:
    ```typescript
    if (quantidadeNoCarrinho + 1 > produto.stock) return alert("Sem stock");
    ```
    Isto previne pedidos inválidos ao backend e melhora a UX com feedback instantâneo.

#### 4. Gestão de Perfil
*   **Sincronização Dual**: A atualização de dados pessoais requer consistência em dois locais. O formulário em `Profile.tsx` executa uma transação implícita:
    1.  Atualiza a tabela pública `perfis` (nome, telemóvel) para exibição na app.
    2.  Invoca `auth.updateUser` para atualizar os metadados protegidos do utilizador no sistema de autenticação.
*   **Histórico em Tempo Real**: A lista de cortes utiliza *Subscriptions* do Supabase para atualizar a vista automaticamente se o estado de uma marcação mudar (ex: de 'pendente' para 'confirmado' pelo admin) sem o utilizador precisar de atualizar a página.

---

## 5. Funcionalidades Administrativas (Backoffice)

O painel de administração (`/admin`) é o centro de comando da barbearia.

### Dashboard
Visão geral com estatísticas vitais:
*   Agendamentos do dia.
*   Receita estimada.
*   Atividade recente (quem marcou o quê).

### Gestão de Entidades
*   **Utilizadores**: Lista todos os clientes. Permite promover utilizadores a barbeiros ou admins.
*   **Produtos**: CRUD completo. Adicionar novos produtos, alterar preços e atualizar stock.
*   **Agendamentos**: Calendário mestre. O admin pode confirmar, cancelar ou remarcar qualquer serviço.

---

## 6. Desafios de Implementação e Soluções (Deep Dive)

### 6.1. Algoritmo de Slots (`getRealAvailableSlots`)
**Desafio:** Impedir sobreposição de horários (Double Booking) num sistema multi-barbeiro.
**Solução:** Criei uma função que:
1.  Recebe o dia e a duração do serviço (ex: 45 min).
2.  Gera todos os slots possíveis (09:00, 09:30, etc.).
3.  Consulta a tabela `Marcacoes` para ver o que já está ocupado.
4.  Filtra os slots que colidem com marcações existentes para aquele barbeiro específico.

### 6.2. Gestão de Estado Global (`AuthContext`)
**Desafio:** Manter o utilizador logado e saber o seu "Role" em qualquer página sem fazer pedidos repetidos à API.
**Solução:** Um Context Provider que carrega o utilizador no arranque da app e disponibiliza o objeto `user` e a string `role` para toda a árvore de componentes. Inclui lógica de "Retry" para lidar com atrasos na criação do perfil na base de dados.

### 6.3. Otimização de Imagens
**Desafio:** O site estava lento devido a imagens pesadas na galeria.
**Solução:** Implementação de Lazy Loading e uso do Supabase Storage para servir imagens otimizadas, melhorando drasticamente o Largest Contentful Paint (LCP).

---

## 7. Instalação e Manual de Utilização

### Pré-requisitos
*   Node.js (v18 ou superior)
*   Conta Supabase (para o backend)

### Comandos de Instalação

1.  **Clonar o repositório**
    ```bash
    git clone https://github.com/exemplo/barbearia-dourado.git
    cd barbearia-dourado
    ```

2.  **Instalar dependências**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configurar Ambiente**
    Criar um ficheiro `.env` na raiz:
    ```env
    VITE_SUPABASE_URL=sua_url_aqui
    VITE_SUPABASE_ANON_KEY=sua_chave_aqui
    ```

4.  **Iniciar Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```
    A aplicação ficará disponível em `http://localhost:5173`.

---

## 8. Conclusão e Melhorias Futuras

### Conclusão
O projeto **Barbearia Dourado** atingiu todos os objetivos propostos. A migração da tabela `Marcacoes` e a estruturação sólida da base de dados garantem que o sistema é escalável. A interface é rápida, moderna e responsiva.

### Melhorias Futuras (Roadmap)
Para versões futuras, planeia-se implementar:
*   **Notificações SMS/Email**: Avisar o cliente 24h antes do corte.
*   **Pagamentos Online**: Integração com Stripe ou MB Way para pré-pagamento.
*   **App Móvel**: Criar uma versão React Native para iOS e Android.