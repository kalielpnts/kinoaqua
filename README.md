# KinoAqua

Plataforma full stack de cinema: vitrine de filmes com trailer, mapa interativo de poltronas, bomboniere, sacola unificada, ticket digital vetorial e painel administrativo completo. Projeto de demonstração, identidade visual índigo profundo e verde-água, sem emojis (somente ícones lucide-react e ilustrações SVG próprias).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React |
| Backend | Node.js, Express 5, Mongoose 9, JWT |
| Banco | MongoDB (Atlas via MONGO_URI, ou MongoDB em memória quando vazio) |
| Deploy | Vercel (frontend), Railway (backend), MongoDB Atlas (banco) |

## Arquitetura e fluxo

    Navegador (React/Vite)
        |  fetch  VITE_API_URL + /api/...   (em dev: proxy do Vite para a porta 3001)
        v
    API Express (backend/server.js)
        |  rotas -> middleware de auth (JWT) -> models Mongoose
        v
    MongoDB (Atlas ou memória)

Fluxo de uma compra: o usuário escolhe filme e sessão, o frontend carrega o mapa em GET /api/movies/:id/seats, monta a sacola (poltronas e combos) no CartContext e envia POST /api/tickets. O backend valida sessão, poltronas inexistentes, quebradas e ocupadas, reserva as poltronas com um índice único (filme, sessão, poltrona) que impede compra simultânea da mesma cadeira, grava o ticket e devolve o ticket digital.

Perfis: o papel (admin ou user) é identificado pelo e-mail no login, comparando com a lista de administradores (3 contas fixas mais a variável ADMIN_EMAILS).

## Estrutura

    backend/
      server.js            entrada (conecta banco, seed, sobe a API)
      src/app.js           Express, CORS, rotas, tratamento de erros
      src/config.js        variáveis e constantes (VIP x1.5, limite de 10 poltronas)
      src/db.js            conexão Atlas ou memória
      src/models/          User, Movie (com sala), Combo, Ticket, SeatReservation
      src/routes/          auth, movies, combos, tickets, admin
      src/utils/           youtube (normaliza links), seats, serialize
      src/seed.js          6 contas, filmes e combos iniciais
      test-backend.js      testes automatizados da API
    frontend/
      src/pages/           Login, Home, Booking, MyTickets, Admin
      src/components/      SeatMap, TicketDigital, BagLayer, BrandLogo, admin/*
      src/context/         AuthContext, CartContext
      src/lib/             api, format, youtube, rooms
      vercel.json          fallback de SPA (evita 404 no React Router)

## Rodando no Codespaces

    cd backend && npm install && cd ../frontend && npm install && cd ..
    ./dev.sh

Abra a porta 5173. Sem MONGO_URI o banco é temporário (dados somem ao reiniciar; o seed recria tudo).

## Variáveis de ambiente

| Arquivo | Variável | Descrição |
|---|---|---|
| backend/.env | PORT | Porta (Railway injeta sozinho) |
| backend/.env | MONGO_URI | String do MongoDB Atlas. Vazia = banco em memória |
| backend/.env | JWT_SECRET | Segredo dos tokens. Troque em produção |
| backend/.env | CORS_ORIGINS | Origens permitidas, separadas por vírgula (ex: https://kinoaqua.vercel.app) |
| backend/.env | ADMIN_EMAILS | E-mails extras tratados como administradores |
| frontend/.env | VITE_API_URL | URL do backend, sem barra final. Vazia em dev (proxy) |

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admKaliel@gmail.com | KalielADM |
| Admin | admComum@gmail.com | ComumADM |
| Admin | admPrincipal@gmail.com | PrincipalADM |
| Usuário | ponteskaliel@gmail.com | Kalielsenha |
| Usuário | usuario@gmail.com | Usuariosenha |
| Usuário | usuario2@gmail.com | Usuario2senha |

Aviso: senhas em texto simples e perfil por e-mail são escolhas deliberadas de um sistema de demonstração. Não use em produção real.

## Funcionalidades

Usuário: catálogo com busca em tempo real e filtro por gênero, cards com inclinação 3D, modal de trailer e ficha da sala, mapa de poltronas (disponível, selecionada, ocupada, manutenção com motivo, VIP), bomboniere, sacola unificada, ticket digital animado e histórico em Meus ingressos.

Administrador (rota /admin): indicadores (ingressos, pedidos, receita, filmes, combos, manutenção por sala), cadastro e edição de filmes com pôster em prévia e trailer do YouTube convertido para embed em tempo real, configuração da sala (nome, tecnologia, fileiras, colunas), editor visual de poltronas (manutenção com motivo, VIP, normal), gestão de combos com ilustração SVG ou URL de imagem, ocultar ou excluir filmes e combos.

## API (resumo)

| Método | Rota | Acesso |
|---|---|---|
| POST | /api/auth/login, /api/auth/register | público |
| GET | /api/auth/me | logado |
| GET | /api/movies, /api/movies/:id, /api/movies/:id/seats | público |
| POST, PUT, DELETE | /api/movies, /api/movies/:id | admin |
| PATCH | /api/movies/:id/seats | admin |
| GET | /api/combos | público |
| POST, PUT, DELETE | /api/combos, /api/combos/:id | admin |
| POST | /api/tickets | logado |
| GET | /api/tickets/mine, /api/tickets/:id | logado |
| GET | /api/admin/stats, /api/admin/tickets | admin |

## Testes

    cd backend && npm test

Cobre seed, login das 6 contas, credenciais inválidas, cadastro, criação de filme com conversão do YouTube, bloqueio de poltrona quebrada ou ocupada, combos e bloqueio de rotas administrativas para usuários comuns.

## Deploy

Ordem recomendada: MongoDB Atlas, depois Railway (pasta backend), depois Vercel (pasta frontend). Depois do deploy do frontend, volte ao Railway e coloque a URL da Vercel em CORS_ORIGINS.

## Exemplos de prompts usados na construção

- "Crie a Etapa 1: backend Express + Mongoose com seed de 6 contas, compra com validação de poltronas quebradas e testes automatizados, tudo via blocos bash para o Codespaces, sem emojis."
- "Crie o design system índigo profundo e verde-água com glassmorphism, logo SVG de rolo de cinema e tela de login com feixe de projetor animado."
- "Crie o mapa interativo de poltronas com ícones lucide, tooltip do motivo de manutenção e sacola unificada de ingressos e combos com ticket digital animado."
- "Crie o painel ADM com editor visual de poltronas, prévia de pôster, conversão de link do YouTube em tempo real e gestão de combos."
