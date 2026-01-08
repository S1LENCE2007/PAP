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

### Módulo Cliente
*   **Autenticação**: Login e Registo seguros. O sistema distingue automaticamente se o utilizador é Admin ou Cliente e redireciona-o para a área correta.
*   **Agendamento Inteligente**: O utilizador escolhe o profissional e o serviço. O sistema calcula os "slots" livres baseando-se na duração do serviço.
*   **Loja Online**: Catálogo de produtos com carrinho de compras persistente. O sistema valida o stock antes de permitir a adição.
*   **Perfil**: O cliente pode ver o seu histórico de cortes, agendamentos futuros e atualizar os seus dados pessoais e password.

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