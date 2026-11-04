# 🚀 Como rodar o front

O front roda no Docker com o Vite em modo de desenvolvimento. Não é preciso instalar
Node nem pnpm na máquina.

Ele depende do backend (projeto `tg-api`), que precisa estar rodando antes. O
navegador fala direto com a API e com o WebSocket do backend.

---

# 🧩 Versões

Node e pnpm já vêm na imagem do Docker:

| Componente | Versão |
|---|---|
| Node | 22 |
| pnpm | 11.21 |
| React | 19.2 |
| Vite | rolldown-vite 7.2 |
| TypeScript | 5.9 |
| TanStack Router / Query | 1.169 / 5.100 |
| Tailwind CSS | 4.3 |
| Laravel Echo (WebSocket) | 2.4 |

---

# 📋 Requisitos

- Docker com o Docker Compose (no Windows e no macOS, o **Docker Desktop**)
- Internet na primeira execução, para baixar a imagem e as dependências
- O backend (`tg-api`) rodando. Veja o README dele

---

# ▶️ Subindo

1. Suba o backend: na pasta `tg-api`, rode `docker compose up -d` e espere tudo ficar
   **healthy**.
2. Nesta pasta, rode:

   ```bash
   docker compose up -d
   ```

   O container instala as dependências e inicia o Vite sozinho. Na primeira subida a
   instalação demora um pouco mais.

3. Acesse **http://localhost:15173**

Para acompanhar:

```bash
docker compose logs -f web
```

## Usuários de teste

Criados pelos seeders do backend, todos com a senha `user1234!`:

- `admin@example.com`
- `dev@example.com`
- `company@example.com`
- `client@example.com`

---

# ⚙️ Arquivo `.env`

O `.env` que acompanha o projeto **já está configurado para o backend no Docker**:

- API em `http://localhost:18000`
- WebSocket em `ws://localhost:18080`, com a chave `tg-api-key`

Não é preciso alterar nada para rodar.

As variáveis `VITE_*` são lidas pelo Vite quando ele sobe. Depois de mudar o `.env`,
reinicie o front:

```bash
docker compose restart web
```

---

# 🔌 Conflito de portas

A porta do front no PC é a **15173**, e não a 5173 padrão do Vite, para não conflitar
com algo que já esteja instalado. Se ela estiver em uso, o `docker compose up` falha
com uma mensagem como `Bind for 0.0.0.0:15173 failed: port is already allocated`.

Para trocar, altere `FORWARD_WEB_PORT` no início do `.env` e rode `docker compose up -d`
de novo.

No `docker-compose.yml`, ela aparece no `ports` do serviço `web`:

```yaml
ports:
  - "${FORWARD_WEB_PORT:-15173}:5173"
```

- O lado **esquerdo** é a porta no PC. Ele vem do `.env`; o número depois do `:-` é o
  valor usado se a variável não existir.
- O lado **direito** é a porta dentro do container. **Não altere**.

## Se as portas do backend mudarem

Se alguma porta for trocada no `.env` do `tg-api`, ajuste também o `.env` daqui:

| Mudou no `tg-api` | Ajuste no `.env` deste projeto |
|---|---|
| `FORWARD_APP_PORT` (API) | `VITE_API_BASE_URL`, `VITE_API_SWAGGER_URL`, `VITE_STORAGE_URL` e `VITE_WS_AUTH_ENDPOINT` |
| `FORWARD_REVERB_PORT` (WebSocket) | `VITE_WS_PORT` e `VITE_WSS_PORT` |
| `REVERB_APP_KEY` | `VITE_WS_KEY` |

Para descobrir quem está usando uma porta:

```bash
# Linux / macOS
lsof -i :15173

# Windows (PowerShell ou cmd)
netstat -ano | findstr :15173
```

---

# 🛠️ Comandos úteis

```bash
# Ver os logs
docker compose logs -f web

# Reiniciar (depois de mudar o .env)
docker compose restart web

# Rodar um comando do pnpm dentro do container
docker compose exec web pnpm <comando>

# Parar
docker compose down

# Parar e apagar as dependências instaladas (são reinstaladas na próxima subida)
docker compose down -v
```

> **Linux:** o container roda com o usuário `1000:1000` (`UID`/`GID` no `.env`). Se o
> seu usuário tiver outro UID (veja com `id -u` e `id -g`), ajuste os dois valores no
> `.env`. No Windows e no macOS isso não é necessário.

---

Para rodar sem Docker, veja o [install_instruction.md](install_instruction.md).
