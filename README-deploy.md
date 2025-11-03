Deploy na DigitalOcean — guia rápido

Este arquivo contém um resumo das ações para publicar a aplicação usando o Container Registry e App Platform ou um Droplet.

Principais passos

- Criar um Container Registry na DigitalOcean e anotar seu nome (por ex. "meureg").
- Autenticar Docker com o registry (use `doctl registry login` ou `docker login registry.digitalocean.com`).
- Buildar suas imagens localmente e enviar para o registry (tag com `registry.digitalocean.com/nolagodlevel/<service>:tag`).
- Usar App Platform apontando para as imagens no registry, ou criar um Droplet e usar `docker compose -f docker-compose.prod.yml up -d`.

Veja instruções detalhadas e comandos sugeridos no README principal ou peça para eu gerar um script passo-a-passo.
